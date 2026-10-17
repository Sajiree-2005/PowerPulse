# ⚡ PowerPulse — Building Energy Demand Forecasting

**Forecast. Detect. Explain. Plan.**

PowerPulse is an ML-powered building energy intelligence platform that forecasts electricity demand, identifies potential peak-demand periods, compares forecasting models, and provides explainable alerts to support smarter energy planning.

By combining time-series deep learning with an interactive analytics dashboard, PowerPulse helps building operators anticipate demand fluctuations and make more informed operational decisions.

## 🔗 Live Links

| Resource | Link |
|---|---|
| **Live Application** | `[Add your Vercel deployment URL]` |
| **Backend API** | https://powerpulse-fd34.onrender.com |
| **API Health Check** | https://powerpulse-fd34.onrender.com/api/v1/health |
| **Interactive API Documentation** | https://powerpulse-fd34.onrender.com/docs |
| **GitHub Repository** | https://github.com/Sajiree-2005/PowerPulse |
| **Dataset** | [ASHRAE — Great Energy Predictor III](https://www.kaggle.com/competitions/ashrae-energy-prediction) |

> The backend health endpoint currently reports that the LSTM, MLP, and Transformer models are loaded and that demo mode is disabled. Actual forecast generation also depends on compatible historical data and successful inference.

## 🎯 The Problem

Building electricity demand changes throughout the day due to occupancy patterns, weather, operating schedules, and other factors. Without reliable forecasts, facility operators may struggle to anticipate demand peaks and plan energy usage effectively.

PowerPulse addresses this challenge by:

- Forecasting upcoming electricity demand from historical observations.
- Identifying periods that may exceed a configurable demand threshold.
- Comparing model predictions against a baseline.
- Explaining potential peak-demand alerts through interpretable, rule-based insights.
- Presenting forecasts, model diagnostics, and system health in a unified dashboard.

**Goal:** Support proactive energy planning through predictive insights, not claim automatic energy savings.

## ✨ Key Features

### 1. Energy Overview Dashboard
- Key demand indicators and forecast summaries.
- Historical-versus-forecast visualizations.
- Predicted peak-demand periods and risk indicators.
- At-a-glance operational insights.

### 2. Forecast Explorer
- Explore LSTM and MLP forecasts and compare their outputs.
- Select supported forecasting horizons: 6, 12, or 24 hours.
- Inspect timestamp-wise predictions and demand trends.
- Export forecast data to CSV for further analysis.

### 3. Model Comparison
- Compare LSTM and MLP against a lag-based baseline.
- Review MAE, RMSE, and sMAPE where evaluated values are available.
- Visualize actual-versus-predicted demand.
- Inspect training and validation loss curves when corresponding data is available.

### 4. Explainable Peak-Demand Alerts
- Configure the demand threshold.
- Identify forecast periods that cross the threshold.
- Review alert severity and demand trends.
- Present rule-based explanations and suggested operational considerations.

### 5. Data and System Monitoring
- Inspect API and model status.
- Review data-quality information and available demand history.
- Check whether the backend is using real inference or demo fallback data.
- Access backend health information and API documentation.

## 🧠 Machine Learning Approach

PowerPulse includes trained deep-learning artifacts and a shared preprocessing pipeline designed to keep model inputs consistent between training and inference.

| Component | Purpose |
|---|---|
| **LSTM** | Learns temporal patterns from sequential demand observations. |
| **MLP** | Learns nonlinear relationships from engineered input features. |
| **Transformer** | Additional trained forecasting artifact included in the model bundle. |
| **Lag-based baseline** | Provides a simpler reference for evaluating forecasting performance. |

### Forecasting Workflow

1. **Data preparation:** Process timestamped building-demand observations and relevant available features.
2. **Feature engineering:** Construct time-based and other configured features in the required order.
3. **Preprocessing:** Apply the saved feature scaler and construct the historical input window.
4. **Inference:** Run the supported forecasting model or models using the trained artifacts.
5. **Post-processing:** Inverse-transform predictions into the target measurement scale and prevent negative demand predictions.
6. **Evaluation and insights:** Compare forecasts with available holdout results, derive demand-threshold alerts, and present insights through the dashboard.

The backend pipeline is configured around a **168-hour historical input window and a 24-hour forecast output**. Shorter supported forecast horizons can use the corresponding portion of the output.

### Evaluation Metrics

- **MAE — Mean Absolute Error:** Average absolute difference between actual and predicted demand.
- **RMSE — Root Mean Squared Error:** Gives greater weight to larger prediction errors.
- **sMAPE — Symmetric Mean Absolute Percentage Error:** Measures relative prediction error.

Model performance should be reported using actual held-out evaluation results. No accuracy or energy-savings figures are claimed here.

## 🏗️ System Architecture

```text
Historical Building-Demand Data
              │
              ▼
      Data Preprocessing
  Feature Engineering & Scaling
              │
              ▼
       Forecasting Models
      ┌───────┼────────┐
      ▼       ▼        ▼
     LSTM     MLP   Transformer
      │       │        │
      └───────┼────────┘
              ▼
       FastAPI Backend
    Forecasts, Metrics, Alerts
              │
         REST API / JSON
              │
              ▼
       React Dashboard
   Charts, KPIs & Explanations
              │
              ▼
     Energy-Planning Insights
```

## 🛠️ Technology Stack

**Frontend**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

**Backend**
- Python
- FastAPI
- Pydantic
- Pandas and NumPy

**Machine Learning**
- TensorFlow / Keras
- Scikit-learn
- LSTM, MLP and Transformer model artifacts
- Saved feature and target scalers

**Data and Artifacts**
- CSV datasets and historical observations
- JSON pipeline configuration and evaluation metrics
- Keras model files and serialized scalers

**Development and Deployment**
- Jupyter Notebook / Google Colab
- Git and GitHub
- Vercel for the frontend
- Render for the backend

## 📂 Project Structure

```text
PowerPulse/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI routes
│   │   ├── service.py           # Model loading and inference
│   │   ├── config.py            # Environment configuration
│   │   └── schemas.py           # API request/response schemas
│   ├── artifacts/
│   │   ├── models/              # Trained Keras models
│   │   ├── scalers/             # Saved preprocessing scalers
│   │   ├── config/              # Pipeline configuration
│   │   ├── data/                # Historical and evaluation data
│   │   └── metrics.json         # Available evaluation metrics
│   ├── data/
│   │   └── demo_history.csv     # Demo fallback data
│   └── requirements.txt
├── src/
│   ├── components/
│   │   ├── charts/              # Forecast and evaluation charts
│   │   ├── common/              # KPI cards and controls
│   │   └── layout/              # Dashboard layout
│   ├── pages/
│   │   ├── OverviewPage.tsx
│   │   ├── ForecastExplorerPage.tsx
│   │   ├── ModelComparisonPage.tsx
│   │   ├── AlertsPage.tsx
│   │   └── SystemStatusPage.tsx
│   ├── services/
│   │   └── api.ts               # Frontend API integration
│   ├── types/
│   │   └── energy.ts            # TypeScript interfaces
│   ├── mock/
│   │   └── energyData.ts        # Frontend fallback data
│   └── App.tsx
├── Optimized_model.ipynb
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Python 3.11 recommended
- Git
- Compatible trained model artifacts for real inference

### 1. Clone the Repository

```bash
git clone https://github.com/Sajiree-2005/PowerPulse.git
cd PowerPulse
```

### 2. Start the Frontend

From the project root:

```bash
npm install
```

Create or update `.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

If `VITE_API_BASE_URL` is omitted, the frontend falls back to its local mock-data implementation rather than making requests to the backend.

### 3. Start the FastAPI Backend

Open a separate terminal:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open the interactive API documentation at http://127.0.0.1:8000/docs.

### 4. Configure the Production Frontend

Set the following environment variable in your Vercel project:

```env
VITE_API_BASE_URL=https://powerpulse-fd34.onrender.com
```

Redeploy the frontend after changing environment variables.

### 5. Configure Backend CORS

The backend reads allowed frontend origins from `CORS_ORIGINS`. Add your actual Vercel deployment origin in the Render environment settings, for example:

```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://your-actual-project.vercel.app
```

Replace the example Vercel domain with your real deployment domain.

## 🔌 API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/health` | API and model health status |
| `GET` | `/api/v1/overview` | Dashboard KPI information |
| `GET` | `/api/v1/history` | Historical demand observations |
| `POST` | `/api/v1/forecast` | Generate a demand forecast |
| `GET` | `/api/v1/models` | Model information and metrics |
| `GET` | `/api/v1/models/compare` | Model comparison and evaluation data |
| `GET` | `/api/v1/alerts` | Peak-demand alerts |
| `GET` | `/api/v1/data-quality` | Data-quality information |

Example forecast request:

```json
{
  "model": "both",
  "horizon": 24,
  "buildingId": "102",
  "thresholdKw": 550
}
```

The backend's interactive documentation provides the available request schemas and response formats.

## 📊 Dataset and Artifacts

The project references the [ASHRAE Great Energy Predictor III competition dataset on Kaggle](https://www.kaggle.com/competitions/ashrae-energy-prediction), which contains building energy readings, building metadata, and weather observations.

The repository also contains exported model artifacts, preprocessing scalers, pipeline configuration, historical data, and evaluation outputs. For reproducible training, use the notebook and the corresponding source data and preprocessing configuration.

**Important:** The configured features, feature order, fitted scalers, model inputs, and prediction target must match the saved artifacts. Incompatible preprocessing can produce invalid forecasts even when a model loads successfully.

## ⚠️ Limitations

- Forecast quality depends on the representativeness and quality of historical data.
- Model status being healthy does not independently establish prediction accuracy.
- Real inference requires compatible input history, saved models, scalers, and configuration.
- Alerts are decision-support signals, not guarantees of future demand peaks.
- Recommendations are intended to inform operators; the system does not automatically control building equipment or guarantee energy savings.
- Metrics should only be presented when supported by actual evaluation data.

## 🔮 Future Scope

- Add more building types and broader weather coverage.
- Expand model benchmarking and validation across buildings.
- Improve alert explanations with additional evidence from historical patterns.
- Introduce model drift monitoring and scheduled retraining.
- Integrate with building-management systems and energy-monitoring platforms.
- Evaluate the operational impact of forecasts through controlled real-world studies.

## 🤝 Contributing

Contributions, issue reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes and test them locally.
4. Open a pull request describing the change.

## 📄 License

Add a `LICENSE` file and specify the project's license before redistributing the repository.

---

**PowerPulse — Turning building energy data into actionable foresight.**