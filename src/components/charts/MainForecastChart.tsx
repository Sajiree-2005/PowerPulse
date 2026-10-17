import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { DataPoint } from '../../types/energy';

interface MainForecastChartProps {
  data: DataPoint[];
  thresholdKw?: number;
  selectedModel?: 'lstm' | 'mlp' | 'both';
  showConfidenceInterval?: boolean;
}

export const MainForecastChart: React.FC<MainForecastChartProps> = ({
  data,
  thresholdKw = 550,
  selectedModel = 'both',
  showConfidenceInterval = true,
}) => {
  const [visibleLines, setVisibleLines] = useState({
    actual: true,
    lstm: true,
    mlp: true,
    threshold: true,
    confidence: true,
  });

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showLstm =
    visibleLines.lstm && (selectedModel === 'both' || selectedModel === 'lstm');
  const showMlp =
    visibleLines.mlp && (selectedModel === 'both' || selectedModel === 'mlp');

  // Custom high-fidelity tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const currentItem = data.find((d) => d.time === label);
    const isForecast = currentItem?.isForecast;

    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm min-w-52 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
          <span className="font-semibold text-slate-800">{label}</span>
          <span
            className={`font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              isForecast ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isForecast ? 'Forecast' : 'Observed'}
          </span>
        </div>

        <div className="space-y-1.5">
          {currentItem?.actualDemand !== null && currentItem?.actualDemand !== undefined && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                Actual Demand:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {currentItem.actualDemand} kW
              </span>
            </div>
          )}

          {currentItem?.lstmDemand !== null && currentItem?.lstmDemand !== undefined && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                LSTM Model:
              </span>
              <span className="font-mono font-bold text-blue-700">
                {currentItem.lstmDemand} kW
              </span>
            </div>
          )}

          {currentItem?.mlpDemand !== null && currentItem?.mlpDemand !== undefined && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                MLP Model:
              </span>
              <span className="font-mono font-bold text-emerald-700">
                {currentItem.mlpDemand} kW
              </span>
            </div>
          )}

          {thresholdKw && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Threshold:
              </span>
              <span className="font-mono">{thresholdKw} kW</span>
            </div>
          )}

          {/* Exceedance indicator if applicable */}
          {currentItem?.lstmDemand && currentItem.lstmDemand > thresholdKw && (
            <div className="mt-1 rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
              ⚠ Exceeds limit by +{currentItem.lstmDemand - thresholdKw} kW
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Top Legend & Interactive Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => toggleLine('actual')}
            className={`flex items-center gap-2 rounded-md px-2 py-1 transition-opacity ${
              visibleLines.actual ? 'opacity-100 font-semibold text-slate-900' : 'opacity-40 text-slate-400 line-through'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            <span>Actual Demand</span>
          </button>

          {(selectedModel === 'both' || selectedModel === 'lstm') && (
            <button
              onClick={() => toggleLine('lstm')}
              className={`flex items-center gap-2 rounded-md px-2 py-1 transition-opacity ${
                visibleLines.lstm ? 'opacity-100 font-semibold text-blue-700' : 'opacity-40 text-slate-400 line-through'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span>LSTM Forecast</span>
            </button>
          )}

          {(selectedModel === 'both' || selectedModel === 'mlp') && (
            <button
              onClick={() => toggleLine('mlp')}
              className={`flex items-center gap-2 rounded-md px-2 py-1 transition-opacity ${
                visibleLines.mlp ? 'opacity-100 font-semibold text-emerald-700' : 'opacity-40 text-slate-400 line-through'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span>MLP Forecast</span>
            </button>
          )}

          <button
            onClick={() => toggleLine('threshold')}
            className={`flex items-center gap-2 rounded-md px-2 py-1 transition-opacity ${
              visibleLines.threshold ? 'opacity-100 font-semibold text-rose-600' : 'opacity-40 text-slate-400 line-through'
            }`}
          >
            <span className="h-1.5 w-3 rounded-xs bg-rose-500" />
            <span>Threshold ({thresholdKw} kW)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
          <span>Left: Historical Observed · Right: AI Multi-Step Forecast</span>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-80 w-full sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
              strokeOpacity={0.7}
            />

            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              interval="preserveStartEnd"
              minTickGap={28}
            />

            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[260, 640]}
              tickFormatter={(v) => `${v} kW`}
              width={65}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Threshold Reference Line */}
            {visibleLines.threshold && thresholdKw && (
              <ReferenceLine
                y={thresholdKw}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Limit: ${thresholdKw} kW`,
                  position: 'insideTopRight',
                  fill: '#e11d48',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Historical vs Forecast divider */}
            <ReferenceLine
              x="18:00 (Now)"
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              label={{
                value: 'Live Ingestion Point',
                position: 'top',
                fill: '#475569',
                fontSize: 11,
                fontWeight: 600,
              }}
            />

            {/* Confidence Area for LSTM Forecast */}
            {showConfidenceInterval && visibleLines.confidence && showLstm && (
              <Area
                type="monotone"
                dataKey="upperConfidence"
                stroke="none"
                fill="#3b82f6"
                fillOpacity={0.08}
                isAnimationActive={true}
              />
            )}

            {/* Actual Observed Demand Line */}
            {visibleLines.actual && (
              <Line
                type="monotone"
                dataKey="actualDemand"
                stroke="#0f172a"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }}
                name="Actual Demand"
                connectNulls={false}
              />
            )}

            {/* LSTM Prediction Line */}
            {showLstm && (
              <Line
                type="monotone"
                dataKey="lstmDemand"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#2563eb' }}
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                name="LSTM Forecast"
                connectNulls={true}
              />
            )}

            {/* MLP Prediction Line */}
            {showMlp && (
              <Line
                type="monotone"
                dataKey="mlpDemand"
                stroke="#059669"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 2, fill: '#059669' }}
                activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                name="MLP Forecast"
                connectNulls={true}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
