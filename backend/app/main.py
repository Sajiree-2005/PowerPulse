
from datetime import datetime, timezone
from typing import Optional
import time
import json
from pathlib import Path

from .config import ALLOWED_ORIGINS, DEFAULT_THRESHOLD_KW, ARTIFACTS_DIR
import numpy as np
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .config import ALLOWED_ORIGINS, DEFAULT_THRESHOLD_KW
from .schemas import ForecastRequest
from .service import service


app = FastAPI(
    title="PowerPulse API",
    version="1.0.0",
    description="Building energy demand forecasting API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Utility functions
# ---------------------------------------------------------

def number(v, default=0.0):
    try:
        x = float(v)
        return x if np.isfinite(x) else default
    except (TypeError, ValueError):
        return default


def metric_value(metrics, *keys):
    """Read a metric regardless of capitalization or key style."""
    if not isinstance(metrics, dict):
        return None

    normalized = {
        str(key).lower().replace("_", "").replace(" ", ""): value
        for key, value in metrics.items()
    }

    for key in keys:
        normalized_key = (
            str(key).lower().replace("_", "").replace(" ", "")
        )
        value = normalized.get(normalized_key)

        if value is not None:
            try:
                result = float(value)
                return result if np.isfinite(result) else None
            except (TypeError, ValueError):
                continue

    return None



def get_metrics_sections():
    """Load the exported evaluation metrics directly from metrics.json."""

    candidates = [
        Path(ARTIFACTS_DIR) / "metrics.json",
        Path(__file__).resolve().parent / "artifacts" / "metrics.json",
        Path(__file__).resolve().parents[1] / "artifacts" / "metrics.json",
        Path(__file__).resolve().parents[2] / "artifacts" / "metrics.json",
    ]

    for path in candidates:
        if not path.is_file():
            continue

        try:
            with path.open("r", encoding="utf-8") as file:
                raw = json.load(file)

            model_metrics = raw.get("models", {})
            validation_metrics = raw.get("validation", {})

            if isinstance(model_metrics, dict):
                return (
                    model_metrics,
                    validation_metrics
                    if isinstance(validation_metrics, dict)
                    else {},
                )

        except (OSError, json.JSONDecodeError) as exc:
            print(f"Could not read metrics file {path}: {exc}")

    print(
        "metrics.json was not found. Checked: "
        + ", ".join(str(path) for path in candidates)
    )

    return {}, {}



def find_model_metrics(section, *possible_names):
    """Find model metrics using case-insensitive model names."""
    if not isinstance(section, dict):
        return {}

    normalized = {
        str(name).strip().lower(): values
        for name, values in section.items()
    }

    for name in possible_names:
        result = normalized.get(name.strip().lower())
        if isinstance(result, dict):
            return result

    return {}


def active_forecast(threshold=DEFAULT_THRESHOLD_KW):
    points, demo = service.forecast("both", 24)

    future = [p for p in points if p.get("isForecast")]

    for point in future:
        point["_effective"] = number(
            point.get("lstmDemand"),
            number(
                point.get("mlpDemand"),
                number(point.get("baselineDemand")),
            ),
        )

    return future, demo


# ---------------------------------------------------------
# Root and health
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "name": "PowerPulse API",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


@app.get("/api/v1/health")
def health():
    demo = service.is_demo()
    loaded_models = service.models

    return {
        "status": "healthy",
        "uptime": round(time.time() - service.started, 2),
        "modelsLoaded": bool(loaded_models) and not demo,
        "apiStatus": "online",
        "modelStatus": {
            "lstm": (
                "ready" if not demo and "lstm" in loaded_models
                else "demo" if demo else "offline"
            ),
            "mlp": (
                "ready" if not demo and "mlp" in loaded_models
                else "demo" if demo else "offline"
            ),
            "transformer": (
                "ready" if not demo and "transformer" in loaded_models
                else "demo" if demo else "offline"
            ),
        },
        "demoMode": demo,
        "modelErrors": service.model_errors,
    }


# ---------------------------------------------------------
# Historical data
# ---------------------------------------------------------

@app.get("/api/v1/history")
def history():
    return service.history_points()


# ---------------------------------------------------------
# Overview
# ---------------------------------------------------------

@app.get("/api/v1/overview")
def overview(
    threshold: float = Query(
        DEFAULT_THRESHOLD_KW, gt=0, le=1000000
    )
):
    hist = [
        p for p in service.history_points()
        if p.get("actualDemand") is not None
    ]

    future, demo = active_forecast(threshold)

    current = (
        number(hist[-1].get("actualDemand")) if hist else 0
    )

    prev = (
        number(hist[-2].get("actualDemand"), current)
        if len(hist) > 1 else current
    )

    nextd = (
        number(
            future[0].get("lstmDemand"),
            number(future[0].get("mlpDemand"), current),
        )
        if future else current
    )

    peak = (
        max(future, key=lambda p: p["_effective"])
        if future else {}
    )

    alerts = [
        p for p in future
        if p["_effective"] > threshold
    ]

    config = service.config or {}

    return {
        "currentDemand": round(current, 3),
        "currentDemandDelta": (
            round((current - prev) / prev * 100, 2)
            if prev else 0
        ),
        "nextHourForecast": round(nextd, 3),
        "nextHourDelta": (
            round((nextd - current) / current * 100, 2)
            if current else 0
        ),
        "peakForecast24h": round(
            peak.get("_effective", current), 3
        ),
        "peakTimeWindow": peak.get("time", "N/A"),
        "peakRiskPeriodsCount": len(alerts),
        "thresholdKw": threshold,
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "demoMode": demo,
        "dataSource": (
            "demo frontend sample"
            if demo
            else config.get(
                "dataset",
                "processed building energy dataset",
            )
        ),
    }


# ---------------------------------------------------------
# Forecast
# ---------------------------------------------------------

@app.post("/api/v1/forecast")
def forecast(req: ForecastRequest):
    points, demo = service.forecast(req.model, req.horizon)

    for point in points:
        for key in [
            "actualDemand",
            "lstmDemand",
            "mlpDemand",
            "baselineDemand",
            "upperConfidence",
            "lowerConfidence",
        ]:
            if point.get(key) is not None:
                point[key] = round(number(point[key]), 3)

    return points


# ---------------------------------------------------------
# Model metrics and metadata
# ---------------------------------------------------------

@app.get("/api/v1/models")
def models():
    model_metrics, validation_metrics = get_metrics_sections()
    demo = service.is_demo()

    # These names match the names in metrics.json.
    model_definitions = [
        {
            "id": "lstm",
            "metric_names": ["LSTM"],
            "name": "LSTM",
            "architecture": (
                "Sequential forecasting over 168 hourly steps"
            ),
            "bestFor": "Hourly demand forecasting",
            "parameterCount": "see model summary",
        },
        {
            "id": "mlp",
            "metric_names": ["MLP"],
            "name": "MLP",
            "architecture": (
                "Flattened 168-hour multivariate input"
            ),
            "bestFor": "Hourly demand forecasting",
            "parameterCount": "see model summary",
        },
        {
            "id": "transformer",
            "metric_names": ["Transformer"],
            "name": "Transformer",
            "architecture": (
                "Transformer-based multivariate forecasting"
            ),
            "bestFor": "Hourly demand forecasting",
            "parameterCount": "see model summary",
        },
        {
            "id": "ensemble",
            "metric_names": ["Ensemble"],
            "name": "Ensemble",
            "architecture": (
                "Combined LSTM, MLP and Transformer predictions"
            ),
            "bestFor": "Combined forecasting performance",
            "parameterCount": "multiple models",
        },
        {
            "id": "baseline",
            "metric_names": [
                "Baseline (previous day)",
                "Baseline",
            ],
            "name": "Persistence baseline",
            "architecture": (
                "Repeats the previous day's hourly demand"
            ),
            "bestFor": "Benchmark reference",
            "parameterCount": "not applicable",
        },
    ]

    output = []

    for definition in model_definitions:
        model_id = definition["id"]

        test_metrics = find_model_metrics(
            model_metrics,
            *definition["metric_names"],
        )

        validation = find_model_metrics(
            validation_metrics,
            *definition["metric_names"],
        )

        # Test metrics are the primary metrics displayed.
        # Validation metrics are provided separately for transparency.
        mae = metric_value(test_metrics, "MAE")
        rmse = metric_value(test_metrics, "RMSE")
        smape = metric_value(test_metrics, "sMAPE")
        cvrmse = metric_value(test_metrics, "CVRMSE")
        nmbe = metric_value(test_metrics, "NMBE")

        loaded = model_id in service.models

        if model_id == "baseline":
            status = "available"
        elif loaded and not demo:
            status = "loaded"
        elif demo:
            status = "demo"
        else:
            status = "not_loaded"

        has_metrics = mae is not None or rmse is not None

        output.append({
            "modelId": model_id,
            "name": definition["name"],
            "architectureDescription": definition["architecture"],
            "mae": mae,
            "rmse": rmse,
            "smape": smape,
            "r2Score": None,
            "cvrmse": cvrmse,
            "nmbe": nmbe,
            "validationMetrics": {
                "mae": metric_value(validation, "MAE"),
                "rmse": metric_value(validation, "RMSE"),
                "smape": metric_value(validation, "sMAPE"),
                "cvrmse": metric_value(validation, "CVRMSE"),
                "nmbe": metric_value(validation, "NMBE"),
            },
            "inferenceLatencyMs": None,
            "parameterCount": definition["parameterCount"],
            "bestFor": definition["bestFor"],
            "isDemoData": demo,
            "status": status,
            "metricsAvailable": has_metrics,
            "metricSource": "test" if has_metrics else None,
            "metricNote": (
                "Saved test-set evaluation metrics"
                if has_metrics
                else "No matching evaluated metrics found."
            ),
        })

    return output


@app.get("/api/v1/models/compare")
def compare():
    model_metrics, validation_metrics = get_metrics_sections()

    return {
        "metrics": models(),
        "lossCurves": [],
        "actualVsPredicted": service.holdout_comparison(),
        "demoMode": service.is_demo(),
        "note": (
            "Model metrics are read from the saved evaluation artifact. "
            "Training curves are not exported by the current notebook. "
            "Actual-vs-predicted points are read from saved holdout "
            "predictions when available. Metrics alone do not mean a "
            "model is currently loaded for inference."
        ),
    }


# ---------------------------------------------------------
# Peak-demand alerts
# ---------------------------------------------------------

@app.get("/api/v1/alerts")
def alerts(
    threshold: float = Query(
        DEFAULT_THRESHOLD_KW, gt=0, le=1000000
    )
):
    future, demo = active_forecast(threshold)
    result = []

    for point in future:
        demand = point["_effective"]

        if demand <= threshold:
            continue

        exceed = round(demand - threshold, 2)
        risk = "High" if exceed >= 25 else "Moderate"

        if point.get("lstmDemand") is not None:
            model_source = "LSTM"
        elif point.get("mlpDemand") is not None:
            model_source = "MLP"
        else:
            model_source = "Baseline"

        result.append({
            "id": f"peak-{len(result) + 1}",
            "timeWindow": point.get(
                "time", point.get("timestamp", "")
            ),
            "startHour": len(result) + 1,
            "predictedDemand": round(demand, 2),
            "threshold": threshold,
            "riskLevel": risk,
            "exceedanceKw": exceed,
            "modelSource": model_source,
            "reasons": [
                (
                    "Forecast demand exceeds the configured "
                    f"threshold by {exceed:.1f} kW."
                ),
                (
                    "Rule-based alert: no causal attribution "
                    "model is configured."
                ),
            ],
            "recommendedActions": [
                (
                    "Review HVAC and major-load schedules "
                    "before the forecast window."
                ),
                (
                    "Stagger discretionary loads where "
                    "operationally safe."
                ),
            ],
            "isDemoData": demo,
        })

    return result


# ---------------------------------------------------------
# Data quality
# ---------------------------------------------------------

@app.get("/api/v1/data-quality")
def data_quality():
    real = service._read_real_history()
    config = service.config or {}

    if real is not None and not real.empty:
        target = pd.to_numeric(
            real["meter_reading"], errors="coerce"
        )

        missing = int(target.isna().sum())
        total = len(real)

        timestamps = pd.to_datetime(
            real["timestamp"], errors="coerce"
        )

        latest = timestamps.max()
        earliest = timestamps.min()

        coverage = (
            f"{earliest.date()} to {latest.date()}"
            if total and pd.notna(earliest) and pd.notna(latest)
            else "No valid timestamps"
        )

        missing_pct = (
            round(missing / total * 100, 3)
            if total else 0
        )

        feature_names = config.get(
            "feature_names",
            config.get("feature_columns", []),
        )

        return {
            "dataset": config.get(
                "dataset",
                "Notebook processed building dataset",
            ),
            "buildingId": str(
                config.get("building_id", "unknown")
            ),
            "buildingType": config.get(
                "primary_use", "Unknown (metadata not supplied)"
            ),
            "squareFootage": config.get(
                "square_feet", config.get("square_footage", 0)
            ),
            "dataCoverage": coverage,
            "rowCount": total,
            "missingValuesPct": missing_pct,
            "missingValues": missing,
            "latestObservation": (
                latest.isoformat()
                if pd.notna(latest) else "N/A"
            ),
            "modelVersion": (
                "notebook-artifacts"
                if service.models else "demo-fallback"
            ),
            "apiStatus": "online",
            "lstmStatus": (
                "ready" if "lstm" in service.models else "offline"
            ),
            "mlpStatus": (
                "ready" if "mlp" in service.models else "offline"
            ),
            "sensorUptimePct": round(100 - missing_pct, 2),
            "samplingInterval": "1 hour (resampled)",
            "featureCount": len(feature_names),
            "demoMode": service.is_demo(),
        }

    # Fallback: bundled illustrative sample data.
    df = service._read_demo()
    hist = df.loc[~df["isForecast"]]

    total = len(hist)
    values = hist["actualDemand"]
    missing = int(values.isna().sum())

    return {
        "dataset": "PowerPulse bundled frontend sample (DEMO)",
        "buildingId": "102",
        "buildingType": "Demo office",
        "squareFootage": 0,
        "dataCoverage": (
            f"{total} hourly sample points "
            "(not full-year coverage)"
        ),
        "rowCount": total,
        "missingValuesPct": (
            round(missing / total * 100, 2) if total else 0
        ),
        "missingValues": missing,
        "latestObservation": (
            str(hist.iloc[-1]["timestamp"])
            if total else "N/A"
        ),
        "modelVersion": "demo-fallback",
        "apiStatus": "online",
        "lstmStatus": "offline",
        "mlpStatus": "offline",
        "sensorUptimePct": None,
        "samplingInterval": "1 hour (sample)",
        "featureCount": 0,
        "demoMode": True,
        "note": (
            "No usable notebook dataset was found. "
            "Values are illustrative frontend demo data."
        ),
    }
