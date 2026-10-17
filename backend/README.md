# PowerPulse FastAPI Backend

FastAPI service for the attached PowerPulse React dashboard. It reuses the notebook's artifact contract (`lstm_model.keras`, `mlp_model.keras`, `feature_scaler.joblib`, `target_scaler.joblib`, `model_config.json`, `metrics.csv`) and feature logic: hourly meter readings, calendar features, optional weather covariates, 168-hour lookback, direct 24-hour output, MinMax scaling, and inverse transformation with the saved target scaler.

## Important data status

The uploaded frontend ZIP contains mock dashboard data but does not contain the notebook's `data/raw` dataset or generated `artifacts/` files. The uploaded notebook is code, not a trained artifact bundle. The backend therefore starts in **DEMO mode** until you copy in the real processed dataset and trained artifacts. Demo values are marked in API responses; no demo model metrics are invented. `metrics.csv` from the notebook currently contains MAE/RMSE only, so sMAPE and R² remain unavailable unless you add evaluated values.

## Setup (Windows PowerShell)

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs`. Health check: `http://127.0.0.1:8000/api/v1/health`.

## Connect notebook outputs

After running the notebook from the project root, copy these files into `backend/artifacts/`:

- `lstm_model.keras`
- `mlp_model.keras`
- `feature_scaler.joblib`
- `target_scaler.joblib`
- `model_config.json`
- `metrics.csv` (optional `test_predictions.csv`)

Copy `data/processed/hourly_building_data.csv` into `backend/data/processed/hourly_building_data.csv`. The notebook expects raw `data/raw/train.csv`, `building_metadata.csv`, and `weather_train.csv` when training. Keep the feature order in `model_config.json` and the scalers matched to the model files. The model expects 168 hourly input rows and predicts 24 steps; API horizons 6 and 12 are slices of that 24-step output.

The notebook currently saves only MAE and RMSE in `metrics.csv`; this backend will not infer or fabricate sMAPE, R², or latency. Missing metrics are returned as JSON `null`.

## Frontend integration

From the frontend project root, set the Vite API base URL and restart Vite:

```powershell
# create/update frontend .env.local
"VITE_API_BASE_URL=http://127.0.0.1:8000" | Set-Content .env.local
npm install
npm run dev
```

The frontend's `src/services/api.ts` already targets the API routes when `VITE_API_BASE_URL` is set. Start the backend first. CORS defaults allow localhost:3000.

## Endpoints

- `GET /api/v1/health`
- `GET /api/v1/overview?threshold=550`
- `GET /api/v1/history`
- `POST /api/v1/forecast` body: `{"model":"both","horizon":24,"buildingId":"102","thresholdKw":550}`
- `GET /api/v1/models`
- `GET /api/v1/models/compare`
- `GET /api/v1/alerts?threshold=550`
- `GET /api/v1/data-quality`

`/api/v1/history` and `/api/v1/forecast` return the frontend's `DataPoint[]` shape. `/api/v1/overview`, `/api/v1/models`, `/api/v1/models/compare`, `/api/v1/alerts`, and `/api/v1/data-quality` follow the TypeScript interfaces in `src/types/energy.ts`.

## Storage and behavior

No database is required. CSV and JSON files are used. The real forecast path loads the saved Keras models and matching joblib scalers, creates the notebook's feature vector in the configured order, reshapes MLP inputs, inverse-scales predictions, and clamps negative demand to zero. If required artifacts or processed data are absent, the service uses bundled sample data explicitly marked as demo.


## Integration notes
- `POST /api/v1/forecast` returns forecast-only points consistently. The frontend appends the latest 12 historical points for chart context.
- `/api/v1/models/compare` reads actual-vs-predicted points from `artifacts/test_predictions.csv` when available. Training-loss curves are not currently exported by the notebook.
- Missing required model features now raise an inference error instead of being silently filled with zeroes.
- Check `/api/v1/health` for `demoMode`, `modelsLoaded`, and `modelErrors`; a healthy HTTP server alone does not mean trained models are active.
