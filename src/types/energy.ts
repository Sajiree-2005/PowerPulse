export type ModelType = 'lstm' | 'mlp' | 'both';
export type ForecastHorizon = 6 | 12 | 24;
export type RiskLevel = 'Normal' | 'Moderate' | 'High';

export interface DataPoint {
  timestamp: string; // ISO or formatted 'HH:mm'
  time: string;
  actualDemand?: number | null;
  lstmDemand?: number | null;
  mlpDemand?: number | null;
  baselineDemand?: number | null;
  upperConfidence?: number | null;
  lowerConfidence?: number | null;
  isForecast?: boolean;
}

export interface KpiOverview {
  currentDemand: number; // kW
  currentDemandDelta: number; // % vs previous hour
  nextHourForecast: number; // kW
  nextHourDelta: number; // % vs current
  peakForecast24h: number; // kW
  peakTimeWindow: string; // e.g. "14:00 – 15:00"
  peakRiskPeriodsCount: number;
  thresholdKw: number;
  lastUpdated: string;
  demoMode?: boolean;
  dataSource?: string;
}

export interface PeakAlertItem {
  id: string;
  timeWindow: string;
  startHour: number;
  predictedDemand: number; // kW
  threshold: number; // kW
  riskLevel: RiskLevel;
  exceedanceKw: number;
  modelSource: 'LSTM' | 'MLP';
  reasons: string[];
  recommendedActions: string[];
}

export interface ModelMetrics {
  modelId: 'lstm' | 'mlp' | 'baseline';
  name: string;
  architectureDescription: string;
  mae: number | null;
  rmse: number | null;
  smape: number | null;
  r2Score: number | null;
  inferenceLatencyMs: number | null;
  parameterCount: string;
  bestFor: string;
  isDemoData: boolean;
  status?: string;
  metricsAvailable?: boolean;
  metricNote?: string;
}

export interface TrainingLossPoint {
  epoch: number;
  lstmTrainLoss: number;
  lstmValLoss: number;
  mlpTrainLoss: number;
  mlpValLoss: number;
}

export interface ActualVsPredictedPoint {
  time: string;
  actual: number;
  lstmPred: number;
  mlpPred: number;
  baselinePred: number;
}

export interface SystemStatusData {
  dataset: string;
  buildingId: string;
  buildingType: string;
  squareFootage: number;
  dataCoverage: string;
  missingValuesPct: number;
  latestObservation: string;
  modelVersion: string;
  apiStatus: 'online' | 'degraded' | 'offline';
  lstmStatus: 'ready' | 'loading' | 'offline';
  mlpStatus: 'ready' | 'loading' | 'offline';
  sensorUptimePct: number;
  samplingInterval: string;
  featureCount: number;
  demoMode?: boolean;
  note?: string;
}
