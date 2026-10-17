import React, { useState } from 'react';
import {
  AlertTriangle,
  Sliders,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Layers,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import { ThresholdSlider } from '../components/common/ThresholdSlider';
import { PeakAlertItem } from '../types/energy';
import { getRiskColor } from '../utils/formatters';

interface AlertsPageProps {
  alerts: PeakAlertItem[];
  thresholdKw: number;
  onThresholdChange: (newThreshold: number) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  thresholdKw,
  onThresholdChange,
}) => {
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(
    alerts.length > 0 ? alerts[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedAlertId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Building #102</span>
            <span aria-hidden="true">·</span>
            <span>Early Warning System</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 text-[10px] tracking-wider uppercase">
              Rule-Based Explainability
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
            Peak Demand Early Warning
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            Know when electricity demand is likely to peak — and understand the physical and operational drivers behind each alert.
          </p>
        </div>

        {/* Explainability methodology banner */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-xs self-start sm:self-auto">
          <HelpCircle className="h-4 w-4 text-blue-600" />
          <span>Rule-based prototype heuristics</span>
        </div>
      </div>

      {/* Interactive Threshold Control */}
      <ThresholdSlider
        value={thresholdKw}
        onChange={onThresholdChange}
        activeAlertsCount={alerts.length}
      />

      {/* Alerts List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Active Peak Alerts ({alerts.length})
          </h2>
          <span className="text-xs text-slate-500">
            Dynamically evaluated against <strong className="font-mono text-slate-900">{thresholdKw} kW</strong>
          </span>
        </div>

        {alerts.length === 0 ? (
          /* Clean Empty State */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No Peak Excursions Detected
            </h3>
            <p className="mt-1 max-w-md text-xs text-slate-500 leading-relaxed">
              At the current threshold of <strong className="font-mono text-slate-800">{thresholdKw} kW</strong>,
              all forecasted demand levels over the next 24 hours remain within nominal operating tolerance.
            </p>
            <button
              onClick={() => onThresholdChange(550)}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              Reset Threshold to 550 kW (Recommended)
            </button>
          </div>
        ) : (
          /* Alert Cards */
          <div className="space-y-4">
            {alerts.map((alert) => {
              const isExpanded = expandedAlertId === alert.id;
              const isHigh = alert.riskLevel === 'High';
              const riskColor = getRiskColor(alert.riskLevel);

              return (
                <div
                  key={alert.id}
                  className={`overflow-hidden rounded-xl border transition-all ${
                    isHigh
                      ? 'border-rose-200 bg-white shadow-xs'
                      : 'border-slate-200 bg-white shadow-xs'
                  }`}
                >
                  {/* Alert Header Row */}
                  <div
                    onClick={() => toggleExpand(alert.id)}
                    className="flex cursor-pointer flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isHigh ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                        }`}
                      >
                        <ShieldAlert className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${riskColor.badge}`}
                          >
                            {alert.riskLevel} DEMAND RISK
                          </span>
                          <span className="text-xs text-slate-300" aria-hidden="true">·</span>
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {alert.timeWindow}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-baseline gap-3 text-xs">
                          <div>
                            <span className="text-slate-500">Predicted Demand: </span>
                            <span className="font-mono text-base font-bold text-slate-900">
                              {alert.predictedDemand} kW
                            </span>
                          </div>
                          <span className="text-slate-300" aria-hidden="true">·</span>
                          <div>
                            <span className="text-slate-500">Threshold: </span>
                            <span className="font-mono font-semibold text-slate-700">
                              {alert.threshold} kW
                            </span>
                          </div>
                          <span className="text-slate-300" aria-hidden="true">·</span>
                          <div className="font-semibold text-rose-600">
                            +{alert.exceedanceKw} kW exceedance
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                        {isExpanded ? 'Hide Details' : 'Explain Peak Driver'}
                      </span>
                      <div className="rounded-md p-1 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Explanation & Planning Recommendations */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-5 text-xs">
                      {/* Section: Why are we seeing this alert? */}
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                          <HelpCircle className="h-4 w-4 text-blue-600" />
                          <span>Why are we seeing this alert?</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          {alert.reasons.map((reason, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs"
                            >
                              <p className="text-slate-700 leading-relaxed font-medium">
                                {reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section: Actionable Energy-Planning Recommendations */}
                      <div className="pt-2 border-t border-slate-200/60">
                        <div className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <span>Operator Energy-Planning Playbook</span>
                        </div>

                        <div className="space-y-2">
                          {alert.recommendedActions.map((action, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/40 p-3 text-slate-700"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                {idx + 1}
                              </span>
                              <p className="leading-relaxed font-medium text-slate-800">
                                {action}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Banner */}
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-[11px] text-slate-500">
                        <span>
                          Target reduction required to clear alert: <strong className="font-mono text-slate-900 font-bold">{alert.exceedanceKw} kW</strong>
                        </span>
                        <span className="font-medium text-blue-600">
                          Estimated peak charge savings: ~$14.20/kW
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
