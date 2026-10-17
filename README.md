# ⚡ PowerPulse: Building Energy Demand Forecasting using LSTM & MLP

> **Forecast → Detect → Explain → Plan**  
> AI-powered building energy intelligence platform that forecasts electricity demand, detects upcoming peak-demand periods, compares LSTM and MLP deep learning models, and provides explainable early warnings to help building operators make better energy-planning decisions.

---

## 🚀 Key Highlights & Hackathon Demo Flow

1. **Overview (Hero Page)**
   - Live telemetry for **Building #102** (ASHRAE commercial office & laboratory benchmark).
   - High-impact KPI matrix: **Current Demand (428 kW)**, **Next Hour Forecast (461 kW)**, **24h Peak Forecast (587 kW)**, and active peak periods.
   - Main visualization: Historical actuals transitioning seamlessly into multi-step deep learning forecasts.
   - Prominent **Peak Demand Early Warning** banner (587 kW expected at 14:00 – 15:00) with direct action to explainability insights.

2. **Forecast Explorer**
   - Interactive workspace with dual model controls (**LSTM | MLP | Dual Compare**).
   - Dynamic forecast horizon switcher (**6 Hours | 12 Hours | 24 Hours**).
   - Granular forecast timeline table with risk badges, baseline deviation, and tolerance flags.
   - **↓ Export Forecast CSV** button for facility energy auditors.

3. **Model Comparison & Intelligence**
   - Side-by-side evaluation of **LSTM** (sequential deep learning), **MLP** (nonlinear feature learning), and **Lag-24h Baseline**.
   - Standardized error metrics: **MAE**, **RMSE**, and **sMAPE** (transparently badged as **DEMO DATA**).
   - Deep model diagnostics: **Actual vs Predicted** curve tracking and **Training vs Validation Loss** convergence over 50 epochs.

4. **Explainable Early Warnings (Innovation Showcase)**
   - Dynamic **Demand Threshold Slider** (400 kW to 700 kW, default: **550 kW**).
   - Real-time recalculation of active peak excursions and risk levels.
   - **"Why are we seeing this alert?"**: Rule-based explainability heuristics detailing rate-of-climb acceleration, diurnal cooling patterns, and historical temperature matches.
   - **Operator Energy-Planning Playbook**: Actionable steps including pre-cooling thermal mass, chiller staging delays, and battery storage peak shaving.

5. **Data & System Status**
   - Telemetry monitoring for **ASHRAE Great Energy Predictor III** dataset.
   - Feature engineering pipeline (14 covariates including dry-bulb temp, solar irradiance, and cyclic embeddings).
   - REST API contracts for seamless plug-in with a FastAPI backend.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4, Plus Jakarta Sans, JetBrains Mono
- **Visualization**: Recharts (ComposedChart, AreaChart, LineChart)
- **Icons**: Lucide React

---

## 📁 Architecture

```text
src/
├── components/
│   ├── charts/
│   │   ├── ActualVsPredictedChart.tsx   # Model holdout comparison
│   │   ├── LossCurvesChart.tsx          # Training & validation loss across epochs
│   │   ├── MainForecastChart.tsx        # Historical to forecast composed chart
│   │   └── SecondaryTrendsChart.tsx     # Today vs yesterday vs 7-day average
│   ├── common/
│   │   ├── KpiCard.tsx                  # Tabular metric cards with visual hierarchy
│   │   ├── SegmentedControl.tsx         # Accessible radio buttons for model/horizon
│   │   └── ThresholdSlider.tsx          # Interactive threshold controller
│   └── layout/
│       ├── Sidebar.tsx                  # Application navigation & service health
│       └── TopHeader.tsx                # Context breadcrumbs & telemetry status
├── mock/
│   └── energyData.ts                    # 48h timeseries, loss curves, and scenarios
├── pages/
│   ├── AlertsPage.tsx                   # Explainable early warnings & threshold slider
│   ├── ForecastExplorerPage.tsx         # Model exploration, timeline table & CSV export
│   ├── ModelComparisonPage.tsx          # LSTM vs MLP vs Baseline intelligence
│   ├── OverviewPage.tsx                 # Hero dashboard & primary forecast chart
│   └── SystemStatusPage.tsx             # Infrastructure & API contracts
├── services/
│   └── api.ts                          # Decoupled API abstraction ready for FastAPI
├── types/
│   └── energy.ts                       # Strong TypeScript definitions
├── utils/
│   ├── exportCsv.ts                     # Client-side forecast CSV generator
│   └── formatters.ts                    # Number, kW, and risk formatters
└── App.tsx                              # State orchestrator & layout shell
```

---

## 🔌 Connecting to a FastAPI Backend

`src/services/api.ts` is pre-configured with endpoints matching a standard FastAPI deployment:

```bash
# Set in your .env or deployment environment:
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Future FastAPI Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health & worker status |
| `GET` | `/api/v1/overview` | Primary KPIs & current demand |
| `GET` | `/api/v1/history` | Historical observed demand series |
| `POST` | `/api/v1/forecast` | Generate multi-step forecast (LSTM / MLP) |
| `GET` | `/api/v1/models/compare` | Validation loss curves & error metrics |
| `GET` | `/api/v1/alerts` | Dynamic threshold alert evaluator |
| `GET` | `/api/v1/data-quality` | Missing value rates & sensor uptime |

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit `http://localhost:3000` to interact with PowerPulse.
