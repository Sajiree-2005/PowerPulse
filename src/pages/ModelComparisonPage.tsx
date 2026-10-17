import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  Info,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { ActualVsPredictedChart } from '../components/charts/ActualVsPredictedChart';
import { LossCurvesChart } from '../components/charts/LossCurvesChart';
import {
  ModelMetrics,
  TrainingLossPoint,
  ActualVsPredictedPoint,
} from '../types/energy';

interface ModelComparisonPageProps {
  metrics: ModelMetrics[];
  lossCurves: TrainingLossPoint[];
  actualVsPredicted: ActualVsPredictedPoint[];
}

export const ModelComparisonPage: React.FC<ModelComparisonPageProps> = ({
  metrics,
  lossCurves,
  actualVsPredicted,
}) => {
  const [activeTab, setActiveTab] = useState<'actual_vs_pred' | 'loss_curves'>('actual_vs_pred');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Model Benchmarking</span>
            <span aria-hidden="true">·</span>
            <span>Building #102 Dataset</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-[10px] tracking-wider uppercase">
              DEMO DATA
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Model Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            Compare how different forecasting approaches perform on building electricity demand time-series.
          </p>
        </div>

        {/* Demo Data Notice */}
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900 max-w-sm self-start sm:self-auto">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800">
            <Info className="h-3.5 w-3.5" />
            <span>Prototype Benchmark Note</span>
          </div>
          <p className="mt-0.5 text-[11px] text-amber-800/90 leading-normal">
            Only metrics backed by saved evaluation artifacts are shown. Missing metrics appear as N/A; bundled demo forecasts are illustrative.
          </p>
        </div>
      </div>

      {/* Three Model Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Model 1: LSTM */}
        <div className="relative rounded-xl border-2 border-blue-600 bg-gradient-to-b from-blue-50/40 via-white to-white p-5 shadow-sm shadow-blue-500/5">
          <div className="absolute top-4 right-4 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Architecture
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">LSTM</h2>
              <p className="text-xs text-blue-700 font-medium">Sequential deep learning</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-relaxed min-h-[48px]">
            Recurrent architecture capable of retaining long-term historical context, diurnal periodicity, and thermal inertia trends.
          </p>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Latency:</span>
              <span className="font-mono font-semibold text-slate-800">N/A (not measured)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Parameters:</span>
              <span className="font-mono text-slate-700">See loaded model</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lookback Window:</span>
              <span className="font-mono text-slate-700">24 Hours (96 steps)</span>
            </div>
          </div>
        </div>

        {/* Model 2: MLP */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">MLP</h2>
              <p className="text-xs text-emerald-700 font-medium">Nonlinear feature learning</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-relaxed min-h-[48px]">
            Feedforward neural network utilizing engineered lag features, calendar embeddings, and outdoor temperature covariates.
          </p>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Latency:</span>
              <span className="font-mono font-semibold text-slate-800">N/A (not measured)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Parameters:</span>
              <span className="font-mono text-slate-700">See loaded model</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Feature Inputs:</span>
              <span className="font-mono text-slate-700">14 covariates</span>
            </div>
          </div>
        </div>

        {/* Model 3: Baseline */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Persistence Baseline</h2>
              <p className="text-xs text-slate-500 font-medium">Previous-day forecast (Lag-24h)</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-relaxed min-h-[48px]">
            Standard facilities benchmark copying yesterday's observed kW to tomorrow's corresponding time.
          </p>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Latency:</span>
              <span className="font-mono font-semibold text-slate-800">Not benchmarked</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Parameters:</span>
              <span className="font-mono text-slate-700">0 (Deterministic)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Peak Detection:</span>
              <span className="font-mono text-rose-600">Poor (Lags transitions)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Performance Metrics Comparison
              </h2>
              <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 tracking-wider uppercase">
                DEMO DATA
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Metrics are computed from saved notebook evaluation artifacts when available; missing values are not fabricated.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Forecasting Model</th>
                <th className="py-3 px-4 text-right">MAE (kW)</th>
                <th className="py-3 px-4 text-right">RMSE (kW)</th>
                <th className="py-3 px-4 text-right">sMAPE (%)</th>
                <th className="py-3 px-4 text-right">R² Score</th>
                <th className="py-3 px-4 text-right">Inference Latency</th>
                <th className="py-3 px-4">Error Reduction vs Baseline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {metrics.map((m) => {
                const isLstm = m.modelId === 'lstm';
                const isMlp = m.modelId === 'mlp';
                const baselineMae = metrics.find((item) => item.modelId === 'baseline')?.mae;
                const reduction =
                  m.modelId !== 'baseline' &&
                  !m.isDemoData &&
                  baselineMae != null && baselineMae > 0 &&
                  m.mae != null
                    ? (((baselineMae - m.mae) / baselineMae) * 100).toFixed(1)
                    : null;

                return (
                  <tr
                    key={m.modelId}
                    className={`transition-colors ${
                      isLstm
                        ? 'bg-blue-50/40 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-sans text-slate-900">
                      <div className="flex items-center gap-2">
                        {isLstm ? (
                          <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                        ) : isMlp ? (
                          <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
                        ) : (
                          <span className="flex h-2 w-2 rounded-full bg-slate-400" />
                        )}
                        <span>{m.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <span className={isLstm ? 'text-blue-700 font-bold' : ''}>
                        {m.mae == null ? 'N/A' : `${m.mae.toFixed(2)} kW`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <span className={isLstm ? 'text-blue-700 font-bold' : ''}>
                        {m.rmse == null ? 'N/A' : `${m.rmse.toFixed(2)} kW`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <span className={isLstm ? 'text-blue-700 font-bold' : ''}>
                        {m.smape == null ? 'N/A' : `${m.smape.toFixed(2)}%`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <span className={isLstm ? 'text-blue-700 font-bold' : ''}>
                        {m.r2Score == null ? 'N/A' : m.r2Score.toFixed(3)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-slate-500">
                      {m.inferenceLatencyMs == null ? 'N/A' : `${m.inferenceLatencyMs} ms`}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      {reduction ? (
                        <span className="font-semibold text-emerald-600">
                          ↓ {reduction}% lower MAE
                        </span>
                      ) : (
                        <span className="text-slate-400">Reference Benchmark</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Split: Actual vs Predicted & Training Loss Curves */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Deep Model Diagnostics
            </h2>
            <p className="text-xs text-slate-500">
              Inspect multi-step curve tracking and neural optimization convergence across epochs.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('actual_vs_pred')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === 'actual_vs_pred'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Actual vs Predicted
            </button>
            <button
              onClick={() => setActiveTab('loss_curves')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                activeTab === 'loss_curves'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Training vs Validation Loss
            </button>
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'actual_vs_pred' ? (
            <div>
              <div className="mb-2 text-xs text-slate-500">
                Holdout comparison is shown only when actual evaluation artifacts are available. The bundled demo does not contain verified holdout predictions.
              </div>
              <ActualVsPredictedChart data={actualVsPredicted} />
            </div>
          ) : (
            <div>
              <div className="mb-2 text-xs text-slate-500">
                Training-loss curves are shown only when training-history artifacts are available.
              </div>
              <LossCurvesChart data={lossCurves} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
