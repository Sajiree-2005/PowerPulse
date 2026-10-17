"""PowerPulse shared preprocessing pipeline.

Used by the training notebooks AND by the FastAPI backend so that training and
serving build *identical* model inputs (no train/serve skew).

Model inputs (all built from PAST observations + known calendar features only):
    hist : (n, INPUT_HOURS, F)  past window: [load_rel, weather..., calendar..., window_pos]
    fut  : (n, HORIZON, 7)      calendar features of the hours to be forecast (known in advance)
    stat : (n, 1)               standardised mean log-load level of the past window
    base : (n, HORIZON)         previous-day load_rel (skip connection = seasonal-naive start point)
Target:
    y    : (n, HORIZON)         (log1p(load) - window_mean) / scale

load_rel = (log1p(kWh) - mean(log1p(kWh) over the window)) / scale
-> level-invariant, which makes the models robust to load drift between seasons.
"""
import numpy as np
import pandas as pd

CAL_COLS = ["hour_sin", "hour_cos", "dow_sin", "dow_cos",
            "month_sin", "month_cos", "is_weekend"]
MODEL_INPUT_KEYS = ("hist", "fut", "stat", "base")


# ----------------------------------------------------------------------------- features
def calendar_features(index):
    idx = pd.DatetimeIndex(index)
    return pd.DataFrame({
        "hour_sin": np.sin(2 * np.pi * idx.hour / 24),
        "hour_cos": np.cos(2 * np.pi * idx.hour / 24),
        "dow_sin": np.sin(2 * np.pi * idx.dayofweek / 7),
        "dow_cos": np.cos(2 * np.pi * idx.dayofweek / 7),
        "month_sin": np.sin(2 * np.pi * (idx.month - 1) / 12),
        "month_cos": np.cos(2 * np.pi * (idx.month - 1) / 12),
        "is_weekend": (idx.dayofweek >= 5).astype(float),
    }, index=idx)


def fill_short_gaps(s, max_gap):
    """Linearly interpolate ONLY interior gaps of <= max_gap hours. Longer gaps stay NaN."""
    s = s.replace([np.inf, -np.inf], np.nan)
    isna = s.isna()
    run_id = (~isna).cumsum()
    run_len = isna.groupby(run_id).transform("sum")
    interp = s.interpolate(method="time", limit_area="inside")
    out = s.copy()
    m = isna & (run_len <= max_gap)
    out[m] = interp[m]
    return out


def make_frame(load, weather=None, weather_cols=(), max_gap_load=6, max_gap_weather=24):
    """Complete hourly grid with cleaned load (kWh), log load, weather and calendar columns."""
    load = pd.Series(load).astype(float)
    load = load[~load.index.duplicated(keep="last")].sort_index()
    idx = pd.date_range(load.index.min(), load.index.max(), freq="h")
    load = load.reindex(idx)
    load = load.where(load >= 0)                       # negative readings -> missing
    load = fill_short_gaps(load, max_gap_load)
    frame = pd.DataFrame({"load_kwh": load}, index=idx)
    frame["log_load"] = np.log1p(frame["load_kwh"])
    for c in weather_cols:
        if weather is not None and c in weather.columns:
            w = weather[c].astype(float)
            w = w[~w.index.duplicated(keep="last")].sort_index()
            w = w.resample("h").mean().reindex(idx)
            w = fill_short_gaps(w, max_gap_weather).ffill(limit=max_gap_weather).bfill(limit=max_gap_weather)
        else:
            w = np.nan
        frame[c] = w
    frame = frame.join(calendar_features(idx))
    frame.index.name = "timestamp"
    return frame


def feature_names(cfg):
    return ["load_rel"] + list(cfg["weather_cols"]) + CAL_COLS + ["window_pos"]


# ----------------------------------------------------------------------------- normaliser
def fit_normalizer(frame, train_end, cfg):
    """Statistics from TRAIN rows only (positions < train_end) -> no leakage."""
    H, wc = cfg["input_hours"], list(cfg["weather_cols"])
    tr = frame.iloc[:train_end]
    L = frame["log_load"]
    ref_all = L.rolling(H, min_periods=H).mean().shift(1)    # window mean aligned at forecast origin
    dev = (L - ref_all).iloc[:train_end].dropna()
    ref_tr = ref_all.iloc[:train_end].dropna()
    wstd = {c: float(tr[c].std()) if tr[c].notna().sum() > 1 else 1.0 for c in wc}
    return {
        "weather_mean": {c: float(tr[c].mean()) if tr[c].notna().any() else 0.0 for c in wc},
        "weather_std": {c: (v if np.isfinite(v) and v > 1e-9 else 1.0) for c, v in wstd.items()},
        "scale": float(dev.std()),
        "ref_mean": float(ref_tr.mean()),
        "ref_std": float(ref_tr.std()),
    }


# ----------------------------------------------------------------------------- windows
def build_inputs(frame, origins, cfg, norm, with_target=True):
    """Build model inputs for forecast origins (integer positions into `frame`).

    A forecast at origin t uses hours [t-H, t) as history and predicts hours [t, t+T).
    origin == len(frame) is a genuine forecast beyond the last observation.
    Windows with missing history (or missing target when with_target) are dropped;
    the surviving origins are returned in out["origins"].
    """
    H, T, wc = cfg["input_hours"], cfg["horizon"], list(cfg["weather_cols"])
    origins = np.asarray(origins, dtype=int)
    N = len(frame)
    ext_idx = frame.index.append(
        pd.date_range(frame.index[-1] + pd.Timedelta(hours=1), periods=T, freq="h"))
    cal = calendar_features(ext_idx)[CAL_COLS].to_numpy(np.float32)
    L = np.concatenate([frame["log_load"].to_numpy(np.float64), np.full(T, np.nan)])
    W = np.zeros((N + T, len(wc)), np.float32)
    for j, c in enumerate(wc):
        z = (frame[c].to_numpy(np.float64) - norm["weather_mean"][c]) / norm["weather_std"][c]
        W[:N, j] = np.nan_to_num(z, nan=0.0)

    ok = (origins >= H) & (origins <= N)
    o = np.where(ok, origins, H)                       # safe indices for invalid origins
    hidx = o[:, None] + np.arange(-H, 0)[None, :]
    fidx = o[:, None] + np.arange(T)[None, :]
    Lh = L[hidx]
    ok &= ~np.isnan(Lh).any(axis=1)
    if with_target:
        Ly = L[fidx]
        ok &= ~np.isnan(Ly).any(axis=1)
    keep = np.where(ok)[0]
    hidx, fidx, Lh = hidx[keep], fidx[keep], Lh[keep]

    ref = Lh.mean(axis=1)
    rel = np.clip((Lh - ref[:, None]) / norm["scale"], -10, 10).astype(np.float32)
    pos = np.broadcast_to(np.linspace(-1, 0, H, dtype=np.float32), (len(keep), H))
    hist = np.concatenate([rel[..., None], W[hidx], cal[hidx], pos[..., None]], axis=2)
    out = {
        "origins": origins[keep],
        "hist": hist.astype(np.float32),
        "fut": cal[fidx],
        "stat": ((ref - norm["ref_mean"]) / norm["ref_std"])[:, None].astype(np.float32),
        "base": rel[:, -T:].astype(np.float32),
        "ref": ref,
    }
    if with_target:
        out["y"] = np.clip((Ly[keep] - ref[:, None]) / norm["scale"], -10, 10).astype(np.float32)
    return out


def model_inputs(d):
    return {k: d[k] for k in MODEL_INPUT_KEYS}


def denormalize(pred_norm, ref, norm):
    """Model output -> kWh."""
    log_pred = np.clip(np.asarray(pred_norm) * norm["scale"] + np.asarray(ref)[:, None], 0.0, 25.0)
    return np.expm1(log_pred)


def actual_kwh(frame, origins, cfg):
    load = frame["load_kwh"].to_numpy(np.float64)
    return load[np.asarray(origins)[:, None] + np.arange(cfg["horizon"])[None, :]]


def naive_baselines(frame, origins, cfg):
    """Previous-day and previous-week forecasts in kWh."""
    load = frame["load_kwh"].to_numpy(np.float64)
    o = np.asarray(origins)[:, None]
    ar = np.arange(cfg["horizon"])[None, :]
    return {"day": load[o - 24 + ar], "week": load[o - 168 + ar]}
