import {
  DataPoint,
  KpiOverview,
  ModelMetrics,
  PeakAlertItem,
  SystemStatusData,
  TrainingLossPoint,
  ActualVsPredictedPoint,
} from '../types/energy';

// 48 hours of time-series data: 24h historical (00:00 - 18:00 today & yesterday) + 24h forecast
export const mockTimeSeriesData: DataPoint[] = [
  // Past 24 hours (Historical)
  { timestamp: '2026-10-15T18:00:00', time: 'Yesterday 18:00', actualDemand: 412, lstmDemand: null, mlpDemand: null, baselineDemand: 405, isForecast: false },
  { timestamp: '2026-10-15T19:00:00', time: 'Yesterday 19:00', actualDemand: 395, lstmDemand: null, mlpDemand: null, baselineDemand: 390, isForecast: false },
  { timestamp: '2026-10-15T20:00:00', time: 'Yesterday 20:00', actualDemand: 372, lstmDemand: null, mlpDemand: null, baselineDemand: 370, isForecast: false },
  { timestamp: '2026-10-15T21:00:00', time: 'Yesterday 21:00', actualDemand: 350, lstmDemand: null, mlpDemand: null, baselineDemand: 348, isForecast: false },
  { timestamp: '2026-10-15T22:00:00', time: 'Yesterday 22:00', actualDemand: 338, lstmDemand: null, mlpDemand: null, baselineDemand: 335, isForecast: false },
  { timestamp: '2026-10-15T23:00:00', time: 'Yesterday 23:00', actualDemand: 326, lstmDemand: null, mlpDemand: null, baselineDemand: 325, isForecast: false },
  { timestamp: '2026-10-16T00:00:00', time: '00:00', actualDemand: 320, lstmDemand: null, mlpDemand: null, baselineDemand: 318, isForecast: false },
  { timestamp: '2026-10-16T01:00:00', time: '01:00', actualDemand: 314, lstmDemand: null, mlpDemand: null, baselineDemand: 312, isForecast: false },
  { timestamp: '2026-10-16T02:00:00', time: '02:00', actualDemand: 310, lstmDemand: null, mlpDemand: null, baselineDemand: 310, isForecast: false },
  { timestamp: '2026-10-16T03:00:00', time: '03:00', actualDemand: 308, lstmDemand: null, mlpDemand: null, baselineDemand: 309, isForecast: false },
  { timestamp: '2026-10-16T04:00:00', time: '04:00', actualDemand: 315, lstmDemand: null, mlpDemand: null, baselineDemand: 314, isForecast: false },
  { timestamp: '2026-10-16T05:00:00', time: '05:00', actualDemand: 332, lstmDemand: null, mlpDemand: null, baselineDemand: 330, isForecast: false },
  { timestamp: '2026-10-16T06:00:00', time: '06:00', actualDemand: 364, lstmDemand: null, mlpDemand: null, baselineDemand: 358, isForecast: false },
  { timestamp: '2026-10-16T07:00:00', time: '07:00', actualDemand: 405, lstmDemand: null, mlpDemand: null, baselineDemand: 398, isForecast: false },
  { timestamp: '2026-10-16T08:00:00', time: '08:00', actualDemand: 442, lstmDemand: null, mlpDemand: null, baselineDemand: 435, isForecast: false },
  { timestamp: '2026-10-16T09:00:00', time: '09:00', actualDemand: 478, lstmDemand: null, mlpDemand: null, baselineDemand: 468, isForecast: false },
  { timestamp: '2026-10-16T10:00:00', time: '10:00', actualDemand: 495, lstmDemand: null, mlpDemand: null, baselineDemand: 489, isForecast: false },
  { timestamp: '2026-10-16T11:00:00', time: '11:00', actualDemand: 512, lstmDemand: null, mlpDemand: null, baselineDemand: 504, isForecast: false },
  { timestamp: '2026-10-16T12:00:00', time: '12:00', actualDemand: 488, lstmDemand: null, mlpDemand: null, baselineDemand: 480, isForecast: false },
  { timestamp: '2026-10-16T13:00:00', time: '13:00', actualDemand: 535, lstmDemand: null, mlpDemand: null, baselineDemand: 520, isForecast: false },
  { timestamp: '2026-10-16T14:00:00', time: '14:00', actualDemand: 562, lstmDemand: null, mlpDemand: null, baselineDemand: 545, isForecast: false },
  { timestamp: '2026-10-16T15:00:00', time: '15:00', actualDemand: 548, lstmDemand: null, mlpDemand: null, baselineDemand: 538, isForecast: false },
  { timestamp: '2026-10-16T16:00:00', time: '16:00', actualDemand: 508, lstmDemand: null, mlpDemand: null, baselineDemand: 495, isForecast: false },
  { timestamp: '2026-10-16T17:00:00', time: '17:00', actualDemand: 456, lstmDemand: null, mlpDemand: null, baselineDemand: 448, isForecast: false },
  // Current Live Point
  { timestamp: '2026-10-16T18:00:00', time: '18:00 (Now)', actualDemand: 428, lstmDemand: 428, mlpDemand: 428, baselineDemand: 422, isForecast: false },
  
  // Future 24 hours (Forecast)
  { timestamp: '2026-10-16T19:00:00', time: '19:00', actualDemand: null, lstmDemand: 461, mlpDemand: 454, baselineDemand: 412, upperConfidence: 478, lowerConfidence: 444, isForecast: true },
  { timestamp: '2026-10-16T20:00:00', time: '20:00', actualDemand: null, lstmDemand: 432, mlpDemand: 426, baselineDemand: 395, upperConfidence: 450, lowerConfidence: 414, isForecast: true },
  { timestamp: '2026-10-16T21:00:00', time: '21:00', actualDemand: null, lstmDemand: 398, mlpDemand: 392, baselineDemand: 372, upperConfidence: 416, lowerConfidence: 380, isForecast: true },
  { timestamp: '2026-10-16T22:00:00', time: '22:00', actualDemand: null, lstmDemand: 365, mlpDemand: 360, baselineDemand: 350, upperConfidence: 382, lowerConfidence: 348, isForecast: true },
  { timestamp: '2026-10-16T23:00:00', time: '23:00', actualDemand: null, lstmDemand: 342, mlpDemand: 340, baselineDemand: 338, upperConfidence: 359, lowerConfidence: 325, isForecast: true },
  { timestamp: '2026-10-17T00:00:00', time: 'Tomorrow 00:00', actualDemand: null, lstmDemand: 326, mlpDemand: 328, baselineDemand: 326, upperConfidence: 343, lowerConfidence: 309, isForecast: true },
  { timestamp: '2026-10-17T01:00:00', time: 'Tomorrow 01:00', actualDemand: null, lstmDemand: 318, mlpDemand: 322, baselineDemand: 320, upperConfidence: 335, lowerConfidence: 301, isForecast: true },
  { timestamp: '2026-10-17T02:00:00', time: 'Tomorrow 02:00', actualDemand: null, lstmDemand: 312, mlpDemand: 316, baselineDemand: 314, upperConfidence: 329, lowerConfidence: 295, isForecast: true },
  { timestamp: '2026-10-17T03:00:00', time: 'Tomorrow 03:00', actualDemand: null, lstmDemand: 310, mlpDemand: 312, baselineDemand: 310, upperConfidence: 327, lowerConfidence: 293, isForecast: true },
  { timestamp: '2026-10-17T04:00:00', time: 'Tomorrow 04:00', actualDemand: null, lstmDemand: 316, mlpDemand: 318, baselineDemand: 308, upperConfidence: 334, lowerConfidence: 298, isForecast: true },
  { timestamp: '2026-10-17T05:00:00', time: 'Tomorrow 05:00', actualDemand: null, lstmDemand: 338, mlpDemand: 335, baselineDemand: 315, upperConfidence: 357, lowerConfidence: 319, isForecast: true },
  { timestamp: '2026-10-17T06:00:00', time: 'Tomorrow 06:00', actualDemand: null, lstmDemand: 374, mlpDemand: 368, baselineDemand: 332, upperConfidence: 395, lowerConfidence: 353, isForecast: true },
  { timestamp: '2026-10-17T07:00:00', time: 'Tomorrow 07:00', actualDemand: null, lstmDemand: 420, mlpDemand: 412, baselineDemand: 364, upperConfidence: 442, lowerConfidence: 398, isForecast: true },
  { timestamp: '2026-10-17T08:00:00', time: 'Tomorrow 08:00', actualDemand: null, lstmDemand: 462, mlpDemand: 450, baselineDemand: 405, upperConfidence: 486, lowerConfidence: 438, isForecast: true },
  { timestamp: '2026-10-17T09:00:00', time: 'Tomorrow 09:00', actualDemand: null, lstmDemand: 494, mlpDemand: 482, baselineDemand: 442, upperConfidence: 519, lowerConfidence: 469, isForecast: true },
  { timestamp: '2026-10-17T10:00:00', time: 'Tomorrow 10:00', actualDemand: null, lstmDemand: 516, mlpDemand: 502, baselineDemand: 478, upperConfidence: 542, lowerConfidence: 490, isForecast: true },
  { timestamp: '2026-10-17T11:00:00', time: 'Tomorrow 11:00', actualDemand: null, lstmDemand: 538, mlpDemand: 524, baselineDemand: 495, upperConfidence: 565, lowerConfidence: 511, isForecast: true },
  { timestamp: '2026-10-17T12:00:00', time: 'Tomorrow 12:00', actualDemand: null, lstmDemand: 512, mlpDemand: 508, baselineDemand: 512, upperConfidence: 538, lowerConfidence: 486, isForecast: true },
  { timestamp: '2026-10-17T13:00:00', time: 'Tomorrow 13:00', actualDemand: null, lstmDemand: 554, mlpDemand: 546, baselineDemand: 488, upperConfidence: 582, lowerConfidence: 526, isForecast: true },
  { timestamp: '2026-10-17T14:00:00', time: 'Tomorrow 14:00', actualDemand: null, lstmDemand: 587, mlpDemand: 574, baselineDemand: 535, upperConfidence: 618, lowerConfidence: 556, isForecast: true },
  { timestamp: '2026-10-17T15:00:00', time: 'Tomorrow 15:00', actualDemand: null, lstmDemand: 572, mlpDemand: 561, baselineDemand: 562, upperConfidence: 602, lowerConfidence: 542, isForecast: true },
  { timestamp: '2026-10-17T16:00:00', time: 'Tomorrow 16:00', actualDemand: null, lstmDemand: 528, mlpDemand: 519, baselineDemand: 548, upperConfidence: 555, lowerConfidence: 501, isForecast: true },
  { timestamp: '2026-10-17T17:00:00', time: 'Tomorrow 17:00', actualDemand: null, lstmDemand: 472, mlpDemand: 465, baselineDemand: 508, upperConfidence: 496, lowerConfidence: 448, isForecast: true },
  { timestamp: '2026-10-17T18:00:00', time: 'Tomorrow 18:00', actualDemand: null, lstmDemand: 435, mlpDemand: 430, baselineDemand: 456, upperConfidence: 458, lowerConfidence: 412, isForecast: true },
];

export const initialKpis: KpiOverview = {
  currentDemand: 428,
  currentDemandDelta: 4.8, // % vs previous hour
  nextHourForecast: 461,
  nextHourDelta: 7.7, // % vs current
  peakForecast24h: 587,
  peakTimeWindow: '14:00 – 15:00',
  peakRiskPeriodsCount: 3,
  thresholdKw: 550,
  lastUpdated: '16 Oct 2026 · 18:00 Local',
};

// Raw alert definitions that will be evaluated against dynamic threshold
export interface AlertScenario {
  id: string;
  timeWindow: string;
  startHour: number;
  lstmKw: number;
  mlpKw: number;
  reasons: string[];
  recommendedActions: string[];
}

export const alertScenarios: AlertScenario[] = [
  {
    id: 'alt-1',
    timeWindow: '14:00 – 15:00',
    startHour: 14,
    lstmKw: 587,
    mlpKw: 574,
    reasons: [
      '📈 Rapid pre-peak demand acceleration (+18% slope between 11:00 and 13:00)',
      '🕒 Diurnal afternoon cooling spike detected (commercial chillers & peak occupant count)',
      '📊 Similar historical hot-Thursday profiles showed sustained demand exceeding 575 kW',
    ],
    recommendedActions: [
      'Pre-cool thermal mass of Building #102 zones between 11:30 – 13:30 to 21.5°C, then float setpoint to 23.5°C during the 14:00 peak.',
      'Stage chiller #2 sequencing delay by 25 minutes to suppress instantaneous kW surge.',
      'Signal non-critical EV fleet charging stations in Basement L2 to limit to Level 1 (3.3 kW) during 14:00 – 15:00.',
    ],
  },
  {
    id: 'alt-2',
    timeWindow: '15:00 – 16:00',
    startHour: 15,
    lstmKw: 572,
    mlpKw: 561,
    reasons: [
      '📈 Thermal inertia sustaining elevated heat load across south-facing glass atrium',
      '🕒 Sustained 32°C ambient external temperature forecast through mid-afternoon',
      '📊 Historical HVAC baseline indicates fan variable frequency drives operating at >85% capacity',
    ],
    recommendedActions: [
      'Initiate automated demand response (ADR) curtailment on secondary ventilation air handling units (AHU 4 & 5).',
      'Dispatch 35 kWh from rooftop battery energy storage system (BESS) to cap utility meter intake.',
    ],
  },
  {
    id: 'alt-3',
    timeWindow: '13:00 – 14:00',
    startHour: 13,
    lstmKw: 554,
    mlpKw: 546,
    reasons: [
      '📈 Ramp-up phase entering peak billing tariff tier ($0.34/kWh Coincident Peak Window)',
      '🕒 Lunch-to-afternoon occupancy transition with elevated cafeteria plug loads',
      '📊 Multi-step LSTM temporal sequence flags high probability of crossing the 550 kW threshold early',
    ],
    recommendedActions: [
      'Alert facilities team to hold off starting non-essential booster water pumps until after 17:30.',
      'Monitor utility real-time meter telemetry for instantaneous ramp exceeding 15 kW/10min.',
    ],
  },
  {
    id: 'alt-4',
    timeWindow: '11:00 – 12:00',
    startHour: 11,
    lstmKw: 538,
    mlpKw: 524,
    reasons: [
      '📈 Mid-morning ramp-up matching elevated solar gain on eastern facade',
      '🕒 Typical meeting room occupancy peak across floors 3 to 7',
      '📊 Baseline divergence: LSTM predicts +8.6% above persistence baseline',
    ],
    recommendedActions: [
      'Review automated solar blind deployment on East wing.',
      'Verify chilled water loop supply temperature maintains 6.5°C target.',
    ],
  },
];

export const mockModelMetrics: ModelMetrics[] = [
  {
    modelId: 'lstm',
    name: 'LSTM (Long Short-Term Memory)',
    architectureDescription: '2-Layer Recurrent Neural Network with 128 hidden units, recurrent dropout (0.2), sequence lookback of 96 quarters (24h).',
    mae: 14.82,
    rmse: 21.35,
    smape: 3.42,
    r2Score: 0.946,
    inferenceLatencyMs: 18.4,
    parameterCount: '194,560 params',
    bestFor: 'Complex non-stationary diurnal trends, multi-step sequential peak detection',
    isDemoData: true,
  },
  {
    modelId: 'mlp',
    name: 'MLP (Multilayer Perceptron)',
    architectureDescription: '3-Layer Feedforward Deep Neural Network (256-128-64), ReLU activations, LayerNorm, trained on lagged kW & dry-bulb temp.',
    mae: 19.64,
    rmse: 27.91,
    smape: 4.88,
    r2Score: 0.908,
    inferenceLatencyMs: 4.2,
    parameterCount: '48,192 params',
    bestFor: 'Ultra-low latency inference, linear-to-moderate nonlinear lag mappings',
    isDemoData: true,
  },
  {
    modelId: 'baseline',
    name: 'Persistence Baseline (Lag-24h)',
    architectureDescription: 'Standard engineering benchmark predicting t + h using demand observed at t + h - 24 hours (previous day equivalent hour).',
    mae: 32.10,
    rmse: 44.75,
    smape: 7.95,
    r2Score: 0.782,
    inferenceLatencyMs: 0.1,
    parameterCount: '0 params (Heuristic)',
    bestFor: 'Sanity benchmark for ML uplift validation and model drift diagnostics',
    isDemoData: true,
  },
];

// 50 training epochs for LSTM and MLP loss visualization
export const mockTrainingLoss: TrainingLossPoint[] = Array.from({ length: 50 }, (_, i) => {
  const epoch = i + 1;
  // Synthetic realistic converging loss curve (MSE in kW^2 normalized)
  const lstmTrain = 0.08 + 0.92 * Math.exp(-epoch / 9.5) + (Math.sin(epoch * 0.8) * 0.005);
  const lstmVal = 0.095 + 0.95 * Math.exp(-epoch / 10.2) + (Math.cos(epoch * 0.7) * 0.008) + (epoch > 40 ? 0.0003 * (epoch - 40) : 0);
  
  const mlpTrain = 0.11 + 0.89 * Math.exp(-epoch / 7.2) + (Math.sin(epoch * 1.1) * 0.007);
  const mlpVal = 0.135 + 0.91 * Math.exp(-epoch / 7.8) + (Math.cos(epoch * 0.9) * 0.012) + (epoch > 35 ? 0.0007 * (epoch - 35) : 0);

  return {
    epoch,
    lstmTrainLoss: Number(lstmTrain.toFixed(4)),
    lstmValLoss: Number(lstmVal.toFixed(4)),
    mlpTrainLoss: Number(mlpTrain.toFixed(4)),
    mlpValLoss: Number(mlpVal.toFixed(4)),
  };
});

// Actual vs Predicted sample test period (24 hours test evaluation window)
export const mockActualVsPredicted: ActualVsPredictedPoint[] = [
  { time: '00:00', actual: 322, lstmPred: 325, mlpPred: 329, baselinePred: 318 },
  { time: '02:00', actual: 312, lstmPred: 314, mlpPred: 319, baselinePred: 310 },
  { time: '04:00', actual: 318, lstmPred: 316, mlpPred: 322, baselinePred: 314 },
  { time: '06:00', actual: 368, lstmPred: 372, mlpPred: 364, baselinePred: 358 },
  { time: '08:00', actual: 445, lstmPred: 449, mlpPred: 438, baselinePred: 435 },
  { time: '10:00', actual: 498, lstmPred: 504, mlpPred: 491, baselinePred: 489 },
  { time: '12:00', actual: 492, lstmPred: 490, mlpPred: 502, baselinePred: 480 },
  { time: '14:00', actual: 574, lstmPred: 579, mlpPred: 563, baselinePred: 545 },
  { time: '16:00', actual: 512, lstmPred: 518, mlpPred: 526, baselinePred: 495 },
  { time: '18:00', actual: 430, lstmPred: 434, mlpPred: 442, baselinePred: 422 },
  { time: '20:00', actual: 376, lstmPred: 379, mlpPred: 385, baselinePred: 370 },
  { time: '22:00', actual: 342, lstmPred: 345, mlpPred: 349, baselinePred: 335 },
];

export const mockSystemStatus: SystemStatusData = {
  dataset: 'ASHRAE Great Energy Predictor III',
  buildingId: 'Building #102',
  buildingType: 'Commercial Office & Research Lab',
  squareFootage: 85400,
  dataCoverage: 'Jan 2024 → Dec 2024 (Continuous hourly)',
  missingValuesPct: 0.4,
  latestObservation: '16 Oct 2026 · 18:00 Local',
  modelVersion: 'PowerPulse-v1.2-rc',
  apiStatus: 'online',
  lstmStatus: 'ready',
  mlpStatus: 'ready',
  sensorUptimePct: 99.85,
  samplingInterval: '15-min raw (aggregated to 1-hour interval)',
  featureCount: 14,
};

// Helper to compute active alerts based on custom threshold
export function computeAlertsForThreshold(thresholdKw: number): PeakAlertItem[] {
  const result: PeakAlertItem[] = [];

  for (const s of alertScenarios) {
    const maxPredicted = Math.max(s.lstmKw, s.mlpKw);
    if (maxPredicted >= thresholdKw) {
      const exceedance = maxPredicted - thresholdKw;
      const riskLevel: 'High' | 'Moderate' | 'Normal' =
        exceedance >= 25 ? 'High' : exceedance >= 0 ? 'Moderate' : 'Normal';

      result.push({
        id: s.id,
        timeWindow: s.timeWindow,
        startHour: s.startHour,
        predictedDemand: s.lstmKw,
        threshold: thresholdKw,
        riskLevel,
        exceedanceKw: exceedance,
        modelSource: 'LSTM',
        reasons: s.reasons,
        recommendedActions: s.recommendedActions,
      });
    }
  }

  return result;
}
