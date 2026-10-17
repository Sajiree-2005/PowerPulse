import { DataPoint } from '../types/energy';

export function exportForecastToCsv(
  data: DataPoint[],
  thresholdKw: number,
  filename = 'powerpulse_forecast_building102.csv'
): void {
  const headers = [
    'Timestamp',
    'Display Time',
    'Actual Demand (kW)',
    'LSTM Forecast (kW)',
    'MLP Forecast (kW)',
    'Persistence Baseline (kW)',
    'Threshold (kW)',
    'Peak Risk',
  ];

  const rows = data.map((d) => {
    const maxPred = Math.max(d.lstmDemand || 0, d.mlpDemand || 0);
    const risk =
      maxPred >= thresholdKw + 25
        ? 'High'
        : maxPred >= thresholdKw
        ? 'Moderate'
        : 'Normal';

    return [
      `"${d.timestamp}"`,
      `"${d.time}"`,
      d.actualDemand !== null && d.actualDemand !== undefined ? d.actualDemand : '',
      d.lstmDemand !== null && d.lstmDemand !== undefined ? d.lstmDemand : '',
      d.mlpDemand !== null && d.mlpDemand !== undefined ? d.mlpDemand : '',
      d.baselineDemand !== null && d.baselineDemand !== undefined ? d.baselineDemand : '',
      thresholdKw,
      d.isForecast ? risk : 'Observed',
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
