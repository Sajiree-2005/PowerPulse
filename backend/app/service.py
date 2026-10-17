"""PowerPulse inference service.

Uses the same exported preprocessing pipeline as the training notebook so that
serving inputs match the inputs used to train LSTM, MLP and Transformer.
"""
from __future__ import annotations

import importlib.util
import json
import pickle
import time
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from .config import DATA_DIR, ARTIFACTS_DIR, DEMO_DATA_PATH


class PowerPulseService:
    """Loads trained PowerPulse artifacts and serves real or demo forecasts."""

    MODEL_NAMES = ("lstm", "mlp", "transformer")
    MODEL_LABELS = {"lstm": "LSTM", "mlp": "MLP", "transformer": "Transformer", "ensemble": "Ensemble"}

    def __init__(self):
        self.started = time.time()
        self.models: dict[str, Any] = {}
        self.feature_scaler = None
        self.target_scaler = None
        self.config: dict[str, Any] = {}
        self.model_errors: dict[str, str] = {}
        self.artifacts_dir = self._find_artifacts_dir()
        self.pipeline = None
        self._load_artifacts()

    def _find_artifacts_dir(self) -> Path:
        app_dir = Path(__file__).resolve().parent
        backend_dir = app_dir.parent
        project_dir = backend_dir.parent
        candidates = [
            Path(ARTIFACTS_DIR),
            project_dir / "artifacts",
            backend_dir / "artifacts",
            app_dir / "artifacts",
        ]
        seen = set()
        for candidate in candidates:
            try:
                candidate = candidate.resolve()
            except Exception:
                continue
            if candidate in seen:
                continue
            seen.add(candidate)
            if candidate.is_dir() and (candidate / "models").is_dir():
                return candidate
        return Path(ARTIFACTS_DIR)

    @staticmethod
    def _first_existing(paths):
        for path in paths:
            if path and Path(path).is_file():
                return Path(path)
        return None

    def _load_pickle(self, path):
        try:
            import joblib
            return joblib.load(path)
        except Exception:
            with open(path, "rb") as f:
                return pickle.load(f)

    def _load_artifacts(self):
        root = self.artifacts_dir
        cfg_path = self._first_existing([
            root / "config" / "pipeline_config.json",
            root / "model_config.json",
            root / "config" / "model_config.json",
        ])
        if cfg_path:
            try:
                self.config = json.loads(cfg_path.read_text(encoding="utf-8"))
                if not isinstance(self.config, dict):
                    raise ValueError("Pipeline config must be a JSON object.")
            except Exception as exc:
                self.model_errors["config"] = str(exc)
        else:
            self.model_errors["config"] = f"Pipeline config not found under {root}."

        # These scalers are kept available for compatibility with older artifacts;
        # the current BDG2 pipeline uses the normalizer saved in pipeline_config.json.
        for attr, candidates in {
            "feature_scaler": [root / "scalers" / "feature_scaler.pkl", root / "feature_scaler.pkl", root / "feature_scaler.joblib"],
            "target_scaler": [root / "scalers" / "target_scaler.pkl", root / "target_scaler.pkl", root / "target_scaler.joblib"],
        }.items():
            p = self._first_existing(candidates)
            if p:
                try:
                    setattr(self, attr, self._load_pickle(p))
                except Exception as exc:
                    self.model_errors[attr] = str(exc)

        pipeline_path = self._first_existing([
            root / "powerpulse_pipeline.py",
            root / "pipeline" / "powerpulse_pipeline.py",
        ])
        if pipeline_path:
            try:
                spec = importlib.util.spec_from_file_location("powerpulse_pipeline_runtime", pipeline_path)
                if spec is None or spec.loader is None:
                    raise ImportError(f"Could not create module loader for {pipeline_path}")
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                self.pipeline = module
                self.model_errors.pop("pipeline", None)
            except Exception as exc:
                self.model_errors["pipeline"] = f"Could not load {pipeline_path}: {exc}"
        else:
            self.model_errors["pipeline"] = f"powerpulse_pipeline.py not found under {root}."

        try:
            import tensorflow as tf
            for name in self.MODEL_NAMES:
                model_path = root / "models" / f"{name}.keras"
                if not model_path.is_file():
                    self.model_errors[name] = f"Model file not found: {model_path}"
                    continue
                try:
                    self.models[name] = tf.keras.models.load_model(str(model_path), compile=False)
                    self.model_errors.pop(name, None)
                except Exception as exc:
                    self.model_errors[name] = f"Could not load {model_path}: {exc}"
        except Exception as exc:
            self.model_errors["tensorflow"] = str(exc)

    def _history_path(self):
        root = self.artifacts_dir
        return self._first_existing([
            root / "data" / "hourly_building_data.csv",
            DATA_DIR / "processed" / "hourly_building_data.csv",
            DATA_DIR / "hourly_building_data.csv",
        ])

    def _read_real_history(self):
        path = self._history_path()
        if path is None:
            self.model_errors["history"] = f"Hourly history CSV not found under {self.artifacts_dir}."
            return None
        try:
            df = pd.read_csv(path)
        except Exception as exc:
            self.model_errors["history"] = f"Could not read {path}: {exc}"
            return None
        if df.empty:
            self.model_errors["history"] = f"History dataset is empty: {path}"
            return None

        timestamp_col = "timestamp" if "timestamp" in df.columns else df.columns[0]
        df["timestamp"] = pd.to_datetime(df[timestamp_col], errors="coerce")
        df = df.dropna(subset=["timestamp"]).sort_values("timestamp")
        if "load_kwh" not in df.columns:
            target_col = next((c for c in ("meter_reading", "meter_reading_kwh", "demand", "energy_demand", "actualDemand") if c in df.columns), None)
            if target_col is None:
                self.model_errors["history"] = f"No demand column found in {path}; columns: {list(df.columns)}"
                return None
            df["load_kwh"] = pd.to_numeric(df[target_col], errors="coerce")
        df["load_kwh"] = pd.to_numeric(df["load_kwh"], errors="coerce")
        df = df.dropna(subset=["load_kwh"])
        if df.empty:
            self.model_errors["history"] = f"No valid load_kwh values found in {path}."
            return None
        if "meter_reading" not in df.columns:
            df["meter_reading"] = df["load_kwh"]
        else:
            df["meter_reading"] = pd.to_numeric(df["meter_reading"], errors="coerce").fillna(df["load_kwh"])
        self.model_errors.pop("history", None)
        return df.reset_index(drop=True)

    def is_demo(self):
        normalizer = self.config.get("normalizer")
        return not (
            all(name in self.models for name in self.MODEL_NAMES)
            and self.pipeline is not None
            and isinstance(normalizer, dict)
            and all(k in normalizer for k in ("weather_mean", "weather_std", "scale", "ref_mean", "ref_std"))
            and self._read_real_history() is not None
        )

    def _read_demo(self):
        try:
            df = pd.read_csv(DEMO_DATA_PATH)
        except Exception as exc:
            self.model_errors["demo_data"] = str(exc)
            return pd.DataFrame(columns=["timestamp", "actualDemand", "lstmDemand", "mlpDemand", "baselineDemand", "upperConfidence", "lowerConfidence", "isForecast"])
        for col in ["actualDemand", "lstmDemand", "mlpDemand", "transformerDemand", "ensembleDemand", "baselineDemand", "upperConfidence", "lowerConfidence"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        if "isForecast" in df.columns:
            df["isForecast"] = df["isForecast"].astype(str).str.lower().eq("true")
        else:
            df["isForecast"] = False
        return df

    def history_points(self):
        real = self._read_real_history()
        if real is not None:
            return [{
                "timestamp": row["timestamp"].isoformat(),
                "time": row["timestamp"].strftime("%Y-%m-%d %H:%M"),
                "actualDemand": float(max(0, row["load_kwh"])),
                "lstmDemand": None, "mlpDemand": None, "transformerDemand": None,
                "ensembleDemand": None, "baselineDemand": None,
                "upperConfidence": None, "lowerConfidence": None, "isForecast": False,
            } for _, row in real.tail(2000).iterrows()]
        df = self._read_demo()
        history = df.loc[~df["isForecast"]].copy()
        return history.astype(object).where(pd.notna(history), None).to_dict("records")

    def _make_pipeline_frame(self, raw):
        if self.pipeline is None:
            raise RuntimeError(self.model_errors.get("pipeline", "Preprocessing pipeline is unavailable."))
        cfg = self.config
        weather_cols = list(cfg.get("weather_cols", []))
        indexed = raw.copy()
        indexed = indexed.set_index(pd.DatetimeIndex(pd.to_datetime(indexed["timestamp"])))
        load = pd.to_numeric(indexed["load_kwh"], errors="coerce")
        weather = indexed[[c for c in weather_cols if c in indexed.columns]].copy()
        core_cfg = {"input_hours": int(cfg.get("input_hours", 168)), "horizon": int(cfg.get("horizon", 24)), "weather_cols": weather_cols}
        frame = self.pipeline.make_frame(load, weather, weather_cols)
        return frame, core_cfg

    def _predict_real(self, raw, model="both", horizon=24):
        if self.pipeline is None:
            raise RuntimeError(self.model_errors.get("pipeline", "Preprocessing pipeline is unavailable."))
        cfg = self.config
        norm = cfg.get("normalizer")
        if not isinstance(norm, dict):
            raise ValueError("pipeline_config.json is missing the saved normalizer.")
        frame, core_cfg = self._make_pipeline_frame(raw)
        train_horizon = int(core_cfg["horizon"])
        if horizon < 1 or horizon > train_horizon:
            raise ValueError(f"This model was trained for a {train_horizon}-hour horizon; requested {horizon}.")
        origin = len(frame)
        inputs = self.pipeline.build_inputs(frame, [origin], core_cfg, norm, with_target=False)
        if len(inputs.get("origins", [])) != 1:
            raise ValueError("Could not build a valid history window. Check recent load gaps and timestamps.")

        pred_kwh = {}
        for name in self.MODEL_NAMES:
            if name not in self.models:
                raise RuntimeError(f"Required model '{name}' is not loaded: {self.model_errors.get(name, 'unknown error')}")
            started = time.perf_counter()
            raw_pred = self.models[name].predict(self.pipeline.model_inputs(inputs), verbose=0)
            values = np.asarray(self.pipeline.denormalize(raw_pred, inputs["ref"], norm)).reshape(-1)
            if len(values) != train_horizon:
                raise ValueError(f"{name} returned {len(values)} steps; expected {train_horizon}.")
            pred_kwh[name] = np.maximum(values, 0.0)
            self.model_errors[f"{name}_last_inference_ms"] = str(round((time.perf_counter() - started) * 1000, 2))
        pred_kwh["ensemble"] = np.mean([pred_kwh[name] for name in self.MODEL_NAMES], axis=0)

        # Previous-day and previous-week baselines use the same completed hourly frame.
        baselines = self.pipeline.naive_baselines(frame, [origin], core_cfg)
        baseline_day = np.asarray(baselines["day"])[0]
        baseline_week = np.asarray(baselines["week"])[0]
        start = frame.index[-1] + pd.Timedelta(hours=1)

        selected = str(cfg.get("selected_model", "Ensemble")).strip().lower()
        selected_key = "ensemble" if selected == "ensemble" else selected
        if selected_key not in pred_kwh:
            selected_key = "ensemble"
        q = cfg.get("interval_log_quantiles", {}) or {}
        q10 = np.asarray(q.get("q10", []), dtype=float).reshape(-1)
        q90 = np.asarray(q.get("q90", []), dtype=float).reshape(-1)
        lower = upper = None
        if len(q10) >= horizon and len(q90) >= horizon:
            chosen = pred_kwh[selected_key][:horizon]
            lower = np.maximum(0.0, np.expm1(np.log1p(chosen) + q10[:horizon]))
            upper = np.maximum(lower, np.expm1(np.log1p(chosen) + q90[:horizon]))

        requested = str(model or "both").strip().lower()
        output = []
        for i in range(horizon):
            ts = start + pd.Timedelta(hours=i)
            include_all = requested in ("both", "all", "ensemble")
            point = {
                "timestamp": ts.isoformat(),
                "time": ts.strftime("%Y-%m-%d %H:%M"),
                "actualDemand": None,
                "lstmDemand": round(float(pred_kwh["lstm"][i]), 3) if include_all or requested == "lstm" else None,
                "mlpDemand": round(float(pred_kwh["mlp"][i]), 3) if include_all or requested == "mlp" else None,
                "transformerDemand": round(float(pred_kwh["transformer"][i]), 3) if include_all or requested == "transformer" else None,
                "ensembleDemand": round(float(pred_kwh["ensemble"][i]), 3) if include_all or requested == "ensemble" else None,
                "baselineDemand": round(float(baseline_day[i]), 3),
                "baselineWeekDemand": round(float(baseline_week[i]), 3),
                "selectedModel": self.MODEL_LABELS.get(selected_key, "Ensemble"),
                "selectedModelDemand": round(float(pred_kwh[selected_key][i]), 3),
                "upperConfidence": round(float(upper[i]), 3) if upper is not None else None,
                "lowerConfidence": round(float(lower[i]), 3) if lower is not None else None,
                "isForecast": True,
            }
            output.append(point)
        self.model_errors.pop("inference", None)
        return output

    def forecast(self, model="both", horizon=24):
        raw = self._read_real_history()
        if raw is not None and not self.is_demo():
            try:
                return self._predict_real(raw, model=model, horizon=int(horizon)), False
            except Exception as exc:
                self.model_errors["inference"] = str(exc)
        demo = self._read_demo()
        future = demo.loc[demo["isForecast"]].head(max(0, int(horizon))).copy()
        items = future.astype(object).where(pd.notna(future), None).to_dict("records")
        requested = str(model or "both").strip().lower()
        for point in items:
            if requested == "mlp":
                point["lstmDemand"] = None
            elif requested == "lstm":
                point["mlpDemand"] = None
            elif requested == "transformer":
                point["lstmDemand"] = None
                point["mlpDemand"] = None
                point["ensembleDemand"] = None
            elif requested == "ensemble":
                point["lstmDemand"] = None
                point["mlpDemand"] = None
                point["transformerDemand"] = None
        return items, True

    def metrics(self):
        """Return saved notebook holdout metrics in the API's lower-case schema."""
        result = {}
        path = self.artifacts_dir / "metrics.json"
        if path.is_file():
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
                models = payload.get("models", payload)
                aliases = {
                    "lstm": ("LSTM", "lstm"),
                    "mlp": ("MLP", "mlp"),
                    "transformer": ("Transformer", "transformer"),
                    "ensemble": ("Ensemble", "ensemble"),
                    "baseline": ("Baseline (previous day)", "baseline", "Baseline"),
                    "baseline_week": ("Baseline (previous week)", "baseline_week"),
                }
                for key, names in aliases.items():
                    row = next((models[n] for n in names if isinstance(models, dict) and isinstance(models.get(n), dict)), None)
                    if row is None:
                        continue
                    converted = {}
                    for metric in ("MAE", "RMSE", "sMAPE", "CVRMSE", "NMBE", "peak_precision", "peak_recall", "peak_f1", "r2", "R2"):
                        value = row.get(metric)
                        if value is not None:
                            try:
                                converted[metric.lower()] = float(value)
                            except (TypeError, ValueError):
                                pass
                    if converted:
                        result[key] = converted
            except Exception as exc:
                self.model_errors["metrics_json"] = str(exc)
        return result

    def holdout_comparison(self):
        path = self._first_existing([
            self.artifacts_dir / "data" / "test_predictions_daily.csv",
            self.artifacts_dir / "test_predictions_daily.csv",
            self.artifacts_dir / "test_predictions.csv",
        ])
        if not path:
            return []
        try:
            frame = pd.read_csv(path)
            timestamp_col = next((c for c in ("timestamp", "forecast_timestamp", "date", "datetime") if c in frame.columns), None)
            actual_col = next((c for c in ("actual", "actualDemand", "y_true") if c in frame.columns), None)
            columns = {
                "lstmPred": next((c for c in ("LSTM", "lstm", "lstmPred", "lstm_prediction") if c in frame.columns), None),
                "mlpPred": next((c for c in ("MLP", "mlp", "mlpPred", "mlp_prediction") if c in frame.columns), None),
                "transformerPred": next((c for c in ("Transformer", "transformer", "transformerPred") if c in frame.columns), None),
                "ensemblePred": next((c for c in ("Ensemble", "ensemble", "ensemblePred") if c in frame.columns), None),
                "baselinePred": next((c for c in ("Baseline (previous day)", "baseline", "baselinePred", "baseline_prediction") if c in frame.columns), None),
            }
            if not timestamp_col or not actual_col or not columns["lstmPred"] or not columns["mlpPred"]:
                return []
            if "origin" in frame.columns and not frame.empty:
                frame = frame[frame["origin"] == frame["origin"].iloc[0]]
            elif "forecast_start" in frame.columns and not frame.empty:
                frame = frame[frame["forecast_start"] == frame["forecast_start"].iloc[0]]
            frame = frame.head(24)
            output = []
            for _, row in frame.iterrows():
                if pd.isna(row[actual_col]):
                    continue
                item = {"time": str(row[timestamp_col]), "actual": float(row[actual_col])}
                for key, col in columns.items():
                    if col and pd.notna(row[col]):
                        item[key] = float(row[col])
                output.append(item)
            return output
        except Exception as exc:
            self.model_errors["holdout_comparison"] = str(exc)
            return []


service = PowerPulseService()
