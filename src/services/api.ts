import {
  DataPoint,
  ForecastHorizon,
  KpiOverview,
  ModelMetrics,
  ModelType,
  PeakAlertItem,
  SystemStatusData,
  TrainingLossPoint,
  ActualVsPredictedPoint,
} from '../types/energy';
import {
  mockTimeSeriesData,
  initialKpis,
  mockModelMetrics,
  mockTrainingLoss,
  mockActualVsPredicted,
  mockSystemStatus,
  computeAlertsForThreshold,
} from '../mock/energyData';

// Base URL configuration for future FastAPI deployment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_REAL_BACKEND = Boolean(API_BASE_URL);

// Simulated network latency for realistic feel and testing loading states
const simulateLatency = <T>(data: T, delayMs: number = 80): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
};

export interface ForecastRequest {
  model: ModelType;
  horizon: ForecastHorizon;
  buildingId?: string;
  thresholdKw?: number;
}

export const energyApi = {
  /**
   * Health check endpoint: GET /api/v1/health
   */
  async getHealth(): Promise<{ status: string; uptime: number; modelsLoaded: boolean }> {
    if (USE_REAL_BACKEND) {
      const res = await fetch(`${API_BASE_URL}/api/v1/health`);
      if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
      return res.json();
    }
    return simulateLatency({ status: 'healthy', uptime: 99.98, modelsLoaded: true }, 50);
  },

  /**
   * Overview KPIs: GET /api/v1/overview
   */
  async getOverview(thresholdKw: number = 550): Promise<KpiOverview> {
    if (USE_REAL_BACKEND) {
      const res = await fetch(`${API_BASE_URL}/api/v1/overview?threshold=${thresholdKw}`);
      if (!res.ok) throw new Error(`Failed to fetch overview: ${res.statusText}`);
      return res.json();
    }
    const alerts = computeAlertsForThreshold(thresholdKw);
    return simulateLatency({
      ...initialKpis,
      thresholdKw,
      peakRiskPeriodsCount: alerts.length,
    });
  },

  /**
   * Historical data: GET /api/v1/history
   */
  async getHistory(): Promise<DataPoint[]> {
    if (USE_REAL_BACKEND) {
      const res = await fetch(`${API_BASE_URL}/api/v1/history`);
      if (!res.ok) throw new Error(`Failed to fetch history: ${res.statusText}`);
      return res.json();
    }
    const historyPoints = mockTimeSeriesData.filter((d) => !d.isForecast);
    return simulateLatency(historyPoints);
  },

  /**
   * Generate or fetch forecast: POST /api/v1/forecast
   */
  async getForecast(params: ForecastRequest): Promise<DataPoint[]> {
    if (USE_REAL_BACKEND) {
      const res = await fetch(`${API_BASE_URL}/api/v1/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`Failed to fetch forecast: ${res.statusText}`);
      return res.json();
    }

    // Filter time-series: show past 12 hours of historical for context + horizon hours of forecast
    const pastHoursContext = 12;
    const historyItems = mockTimeSeriesData.filter((d) => !d.isForecast);
    const slicedHistory = historyItems.slice(Math.max(0, historyItems.length - pastHoursContext));
    
    const forecastItems = mockTimeSeriesData.filter((d) => d.isForecast);
    const slicedForecast = forecastItems.slice(0, params.horizon);

    // Filter/adjust based on model preference
    const combined = [...slicedHistory, ...slicedForecast].map((item) => {
      if (!item.isForecast) return item;
      return {
        ...item,
        // Keep both if 'both', or selectively retain
        lstmDemand: params.model === 'mlp' ? null : item.lstmDemand,
        mlpDemand: params.model === 'lstm' ? null : item.mlpDemand,
      };
    });

    return simulateLatency(combined, 100);
  },

  /**
   * Models list and metadata: GET /api/v1/models
   */
  async getModels(): Promise<ModelMetrics[]> {
    if (USE_REAL_BACKEND) {
      const res = await fetch(`${API_BASE_URL}/api/v1/models`);
      if (!res.ok) throw new Error(`Failed to fetch models: ${res.statusText}`);
      return res.json();
    }
    return simulateLatency(mockModelMetrics);
  },

  /**
   * Model comparison data (metrics, loss curves, actual vs predicted): GET /api/v1/models/compare
   */
  async getModelComparison(): Promise<{
    metrics: ModelMetrics[];
    lossCurves: TrainingLossPoint[];
    actualVsPredicted: ActualVsPredictedPoint[];
  }> {
    if (USE_REAL_BACKEND) {
      const res = await fetch(`${API_BASE_URL}/api/v1/models/compare`);
      if (!res.ok) throw new Error(`Failed to fetch model comparison: ${res.statusText}`);
      return res.json();
    }
    return simulateLatency({
      metrics: mockModelMetrics,
      lossCurves: mockTrainingLoss,
      actualVsPredicted: mockActualVsPredicted,
    });
  },

  /**
   * Explainable alerts evaluated against threshold: GET /api/v1/alerts
   */
  async getAlerts(thresholdKw: number = 550): Promise<PeakAlertItem[]> {
    if (USE_REAL_BACKEND) {
      const res = await fetch(`${API_BASE_URL}/api/v1/alerts?threshold=${thresholdKw}`);
      if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.statusText}`);
      return res.json();
    }
    const computed = computeAlertsForThreshold(thresholdKw);
    return simulateLatency(computed);
  },

  /**
   * Data quality & system status: GET /api/v1/data-quality
   */
  async getSystemStatus(): Promise<SystemStatusData> {
    if (USE_REAL_BACKEND) {
      const res = await fetch(`${API_BASE_URL}/api/v1/data-quality`);
      if (!res.ok) throw new Error(`Failed to fetch system status: ${res.statusText}`);
      return res.json();
    }
    return simulateLatency(mockSystemStatus);
  },
};
