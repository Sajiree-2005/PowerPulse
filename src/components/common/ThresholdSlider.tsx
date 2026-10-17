import React from 'react';
import { Sliders, AlertCircle } from 'lucide-react';

interface ThresholdSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  activeAlertsCount?: number;
}

export const ThresholdSlider: React.FC<ThresholdSliderProps> = ({
  value,
  onChange,
  min = 400,
  max = 700,
  step = 10,
  activeAlertsCount,
}) => {
  const presets = [480, 520, 550, 600];

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Demand Threshold Configuration
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Alert trigger level for building peak shaving & demand charge avoidance.
          </p>
        </div>

        {/* Current Threshold Value Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {value}
            </span>
            <span className="text-xs font-semibold text-slate-500">kW</span>
          </div>

          {activeAlertsCount !== undefined && (
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                activeAlertsCount > 0
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>
                {activeAlertsCount} {activeAlertsCount === 1 ? 'Peak Alert' : 'Peak Alerts'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slider input */}
      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-[11px] font-mono text-slate-600 font-medium">
          <span>{min} kW (Conservative)</span>
          <span className="text-blue-600 font-semibold">{value} kW Active</span>
          <span>{max} kW (High Tolerance)</span>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-600 font-medium">Standard Presets:</span>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`rounded-md border px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                value === p
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p} kW {p === 550 ? '(Default)' : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
