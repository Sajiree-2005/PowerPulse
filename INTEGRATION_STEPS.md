# PowerPulse integration and deployment steps

This package merges the React/Vite frontend with the FastAPI backend and applies integration fixes. It does **not** include trained model weights or the real processed Kaggle dataset: generate those from `base_model.ipynb` before expecting real ML predictions.

## 1. Requirements
- Node.js compatible with the versions in `package.json` (Vite 8 requires a current Node release; use a supported current LTS release).
- Python 3.11 recommended for the TensorFlow dependency set.
- Git, if you plan to deploy from GitHub.

## 2. Generate model artifacts
1. Open `base_model.ipynb` in Colab/Jupyter and run all cells using your intended dataset/building/meter.
2. The notebook exports `lstm_model.keras`, `mlp_model.keras`, `feature_scaler.joblib`, `target_scaler.joblib`, `metrics.csv`, `model_config.json`, and `test_predictions.csv`.
3. Copy those files into `backend/artifacts/` (create the directory if needed).
4. Copy the notebook's `hourly_building_data.csv` into `backend/data/processed/hourly_building_data.csv`.
5. Ensure the model config's `feature_columns`, `input_hours`, building ID and meter match the processed CSV and fitted scaler. Do not substitute missing required features with zeroes.

## 3. Start the backend (Windows PowerShell)
From the repository root:
```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Open `http://127.0.0.1:8000/docs` and `http://127.0.0.1:8000/api/v1/health`. Health can respond while the application is in demo mode; check `demoMode`, `modelsLoaded`, `modelStatus`, and `modelErrors` before calling it integrated.

## 4. Start the frontend
In a second terminal at the repository root:
```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```
The local `.env.example` uses `VITE_API_BASE_URL=http://127.0.0.1:8000`. Open `http://localhost:3000`. Restart Vite after changing `.env.local`.

## 5. Integration smoke tests
- `GET /api/v1/health`: verify whether real models/scalers/data are loaded; demo mode must be false for real inference.
- `GET /api/v1/history`: confirm timestamps and demand units match the processed data.
- `POST /api/v1/forecast` with `{"model":"both","horizon":24,"buildingId":"102","thresholdKw":550}`: confirm a 24-point future forecast and plausible nonnegative values.
- `GET /api/v1/models` and `/api/v1/models/compare`: metrics/holdout comparisons must come from saved evaluation artifacts, not illustrative demo forecasts.
- Check all dashboard pages, browser console/network requests, threshold alerts and CSV export.

## 6. Deployment
Deploy the backend first to a Python-capable host (e.g. Render), then deploy the frontend (e.g. Vercel).

Backend:
- Set the working directory to `backend` if the host supports it; otherwise configure its build/start commands for the backend folder.
- Build/install command: `pip install -r requirements.txt`.
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (adapt `$PORT` to the host's variable convention).
- Set `CORS_ORIGINS` to the exact deployed frontend origin(s), comma-separated.
- Ensure trained model artifacts and processed data are available on every deploy/restart. Use versioned artifact storage or persistent storage if they are too large for Git; do not rely on ephemeral disk persistence.

Frontend:
- Set build-time environment variable `VITE_API_BASE_URL` to the deployed backend HTTPS origin, without a trailing slash.
- Build command: `npm run build`; publish directory: `dist`.
- Rebuild/redeploy after changing Vite environment variables.

After deployment, retest the health, forecast and data-quality endpoints and inspect browser Network/Console. Check host limits for TensorFlow memory, build time and disk usage before choosing a free tier.
