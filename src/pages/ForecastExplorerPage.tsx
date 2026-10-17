import React, { useState } from 'react';
import {
  Download,
  Filter,
  Layers,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { MainForecastChart } from '../components/charts/MainForecastChart';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { DataPoint, ForecastHorizon, ModelType } from '../types/energy';
import { exportForecastToCsv } from '../utils/exportCsv';
import { formatKw, formatKwNumber, getRiskColor } from '../utils/formatters';

interface ForecastExplorerPageProps {
  timeSeriesData: DataPoint[];
  thresholdKw: number;
  onNavigateToAlerts: () => void;
}

export const ForecastExplorerPage: React.FC<ForecastExplorerPageProps> = ({
  timeSeriesData,
  thresholdKw,
  onNavigateToAlerts,
}) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>('both');
  const [selectedHorizon, setSelectedHorizon] = useState<ForecastHorizon>(24);
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Moderate' | 'Normal'>('All');

  // Filter time series based on selected horizon (slice forecast items)
  const historyPoints = timeSeriesData.filter((d) => !d.isForecast);
  const forecastPoints = timeSeriesData.filter((d) => d.isForecast).slice(0, selectedHorizon);
  const activeData = [...historyPoints.slice(-12), ...forecastPoints];

  // Timeline table items (only forecast items for the selected horizon)
  const timelineRows = forecastPoints.map((item) => {
    const demandVal =
      selectedModel === 'mlp'
        ? item.mlpDemand || 0
        : item.lstmDemand || 0;

    const exceedance = demandVal - thresholdKw;
    const risk: 'High' | 'Moderate' | 'Normal' =
      exceedance >= 25 ? 'High' : exceedance >= 0 ? 'Moderate' : 'Normal';

    const baselineDelta =
      item.baselineDemand && demandVal
        ? ((demandVal - item.baselineDemand) / item.baselineDemand) * 100
        : 0;

    return {
      ...item,
      effectiveDemand: demandVal,
      risk,
      exceedance,
      baselineDelta,
    };
  });

  const filteredTimeline = timelineRows.filter((row) => {
    if (riskFilter === 'All') return true;
    return row.risk === riskFilter;
  });

  const handleExportCsv = () => {
    exportForecastToCsv(
      activeData,
      thresholdKw,
      `powerpulse_forecast_${selectedHorizon}h_${selectedModel}.csv`
    );
  };

  const modelOptions = [
    { id: 'both' as ModelType, label: 'Both (Compare)', badge: 'Dual' },
    { id: 'lstm' as ModelType, label: 'LSTM Only', badge: 'RNN' },
    { id: 'mlp' as ModelType, label: 'MLP Only', badge: 'Dense' },
  ];

  const horizonOptions = [
    { id: 6 as ForecastHorizon, label: '6 Hours' },
    { id: 12 as ForecastHorizon, label: '12 Hours' },
    { id: 24 as ForecastHorizon, label: '24 Hours' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Building #102</span>
            <span aria-hidden="true">·</span>
            <span>Forecasting Engine</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-blue-600 font-semibold">Configured: {thresholdKw} kW</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Forecast Explorer
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Explore future electricity demand using our sequential LSTM and nonlinear MLP models.
          </p>
        </div>

        {/* Export CSV action button */}
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-blue-600" />
          <span>Export Forecast CSV</span>
        </button>
      </div>

      {/* Control Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
        {/* Model Selector */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-xs font-semibold text-slate-700">Forecasting Model:</span>
          <SegmentedControl
            options={modelOptions}
            value={selectedModel}
            onChange={(val) => setSelectedModel(val)}
            size="sm"
          />
        </div>

        {/* Horizon Selector */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-xs font-semibold text-slate-700">Horizon:</span>
          <SegmentedControl
            options={horizonOptions}
            value={selectedHorizon}
            onChange={(val) => setSelectedHorizon(val)}
            size="sm"
          />
        </div>
      </div>

      {/* Interactive Forecast Chart Container */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Interactive Demand Curve ({selectedHorizon}-Hour Projection)
            </h2>
            <p className="text-xs text-slate-500">
              Hover over data points to inspect confidence intervals, delta from baseline, and peak flags.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Lookback: 24h</span>
            <span aria-hidden="true">·</span>
            <span>Horizon: {selectedHorizon}h</span>
          </div>
        </div>

        <div className="mt-4">
          <MainForecastChart
            data={activeData}
            thresholdKw={thresholdKw}
            selectedModel={selectedModel}
          />
        </div>
      </div>

      {/* Forecast Timeline Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Table Header & Filter Bar */}
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Forecast Timeline ({selectedHorizon} Steps)
            </h3>
            <p className="text-xs text-slate-500">
              Hourly forecasted electricity demand, baseline deviation, and peak risk categorization.
            </p>
          </div>

          {/* Risk Level Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-1">Risk Filter:</span>
            {(['All', 'High', 'Moderate', 'Normal'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  riskFilter === r
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* High-Density Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4 text-right">LSTM Forecast</th>
                <th className="py-3 px-4 text-right">MLP Forecast</th>
                <th className="py-3 px-4 text-right">Baseline (24h)</th>
                <th className="py-3 px-4 text-right">Delta vs Baseline</th>
                <th className="py-3 px-4">Threshold Status</th>
                <th className="py-3 px-4 text-center">Peak Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {filteredTimeline.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No forecast steps matching "{riskFilter}" risk filter.
                  </td>
                </tr>
              ) : (
                filteredTimeline.map((row) => {
                  const riskStyle = getRiskColor(row.risk);
                  const isHigh = row.risk === 'High';
                  const isModerate = row.risk === 'Moderate';

                  return (
                    <tr
                      key={row.time}
                      className={`transition-colors hover:bg-slate-50/80 ${
                        isHigh ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-sans font-medium text-slate-900">
                        {row.time}
                      </td>

                      {/* LSTM Column */}
                      <td className="py-3 px-4 text-right tabular-nums">
                        <span
                          className={`font-semibold ${
                            row.lstmDemand && row.lstmDemand >= thresholdKw
                              ? 'text-rose-600'
                              : 'text-blue-700'
                          }`}
                        >
                          {row.lstmDemand ? `${row.lstmDemand} kW` : '—'}
                        </span>
                      </td>

                      {/* MLP Column */}
                      <td className="py-3 px-4 text-right tabular-nums text-slate-700">
                        {row.mlpDemand ? `${row.mlpDemand} kW` : '—'}
                      </td>

                      {/* Baseline Column */}
                      <td className="py-3 px-4 text-right tabular-nums text-slate-400">
                        {row.baselineDemand ? `${row.baselineDemand} kW` : '—'}
                      </td>

                      {/* Delta vs Baseline */}
                      <td className="py-3 px-4 text-right tabular-nums">
                        <span
                          className={`font-medium ${
                            row.baselineDelta > 10
                              ? 'text-rose-600'
                              : row.baselineDelta > 0
                              ? 'text-blue-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {row.baselineDelta > 0 ? `+${row.baselineDelta.toFixed(1)}%` : `${row.baselineDelta.toFixed(1)}%`}
                        </span>
                      </td>

                      {/* Threshold status */}
                      <td className="py-3 px-4 font-sans">
                        {row.exceedance > 0 ? (
                          <span className="font-semibold text-rose-600">
                            +{row.exceedance} kW above {thresholdKw} kW
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {Math.abs(row.exceedance)} kW under limit
                          </span>
                        )}
                      </td>

                      {/* Risk Badge */}
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold border ${riskStyle.badge}`}
                        >
                          {isHigh && <ShieldAlert className="h-3 w-3" />}
                          {isModerate && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                          {!isHigh && !isModerate && (
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                          )}
                          <span>{row.risk}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 p-3.5 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Showing {filteredTimeline.length} of {forecastPoints.length} forecast timesteps</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Threshold: {thresholdKw} kW</span>
          </div>

          <button
            onClick={onNavigateToAlerts}
            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Configure Alert Threshold & Explanations →
          </button>
        </div>
      </div>
    </div>
  );
};
