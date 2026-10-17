import React from 'react';
import {
  Zap,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Building2,
  Calendar,
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { MainForecastChart } from '../components/charts/MainForecastChart';
import { SecondaryTrendsChart } from '../components/charts/SecondaryTrendsChart';
import { DataPoint, KpiOverview, PeakAlertItem } from '../types/energy';

interface OverviewPageProps {
  kpis: KpiOverview;
  timeSeriesData: DataPoint[];
  topAlert?: PeakAlertItem | null;
  onNavigateToAlerts: () => void;
  onNavigateToExplorer: () => void;
  thresholdKw: number;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  kpis,
  timeSeriesData,
  topAlert,
  onNavigateToAlerts,
  onNavigateToExplorer,
  thresholdKw,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Building #102
            </span>
            <span aria-hidden="true">·</span>
            <span>Live Energy Intelligence</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">18:00 Local</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
            Good evening, Energy Manager
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Real-time telemetry and deep neural forecasting across commercial HVAC, lighting, and tenant loads.
          </p>
        </div>

        {/* Quick Horizon Badge / Mode indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 font-medium shadow-xs">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span>Horizon:</span>
            <span className="font-semibold text-slate-800">Next 24 Hours</span>
          </span>

          <button
            onClick={onNavigateToExplorer}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <span>Explore Forecast</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Section - 4 Visually Strong Cards with Primary Importance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Primary - Current Demand */}
        <KpiCard
          title="Current Demand"
          value={kpis.currentDemand}
          unit="kW"
          isPrimary={true}
          badgeLabel="Live Sensor"
          trend={{
            value: kpis.currentDemandDelta,
            label: 'vs previous hour',
            direction: 'up',
            isWarning: false,
          }}
        />

        {/* Card 2: Next Hour Forecast */}
        <KpiCard
          title="Next Hour Forecast"
          value={kpis.nextHourForecast}
          unit="kW"
          badgeLabel="19:00 Model"
          trend={{
            value: kpis.nextHourDelta,
            label: 'projected ramp',
            direction: 'up',
            isWarning: false,
          }}
        />

        {/* Card 3: 24h Peak Forecast */}
        <KpiCard
          title="24h Peak Forecast"
          value={kpis.peakForecast24h}
          unit="kW"
          secondaryText={`Expected at ${kpis.peakTimeWindow}`}
          icon={TrendingUp}
        />

        {/* Card 4: Peak Risk Periods */}
        <KpiCard
          title="Peak Risk Periods"
          value={kpis.peakRiskPeriodsCount}
          unit={kpis.peakRiskPeriodsCount === 1 ? 'window' : 'windows'}
          secondaryText={`Threshold: > ${thresholdKw} kW`}
          icon={AlertTriangle}
          onClick={onNavigateToAlerts}
        />
      </div>

      {/* Prominent Peak Alert Banner */}
      {topAlert && (
        <div className="group relative overflow-hidden rounded-xl border border-rose-200/90 bg-gradient-to-r from-rose-50/90 via-rose-50/40 to-white p-5 shadow-xs transition-all hover:border-rose-300">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    Peak Demand Expected
                  </span>
                  <span className="text-xs text-rose-400" aria-hidden="true">·</span>
                  <span className="font-mono text-xs font-semibold text-rose-900">
                    Window: {topAlert.timeWindow}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-2xl font-extrabold text-slate-900 tabular-nums">
                    {topAlert.predictedDemand} kW
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    Demand is expected to exceed the configured{' '}
                    <strong className="font-mono font-bold text-slate-900">{thresholdKw} kW</strong> threshold by{' '}
                    <strong className="font-mono font-bold text-rose-600">+{topAlert.exceedanceKw} kW</strong>.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToAlerts}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-50 active:scale-95 transition-all sm:self-center"
            >
              <span>View Explanation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Forecast Visualization (Primary Centerpiece) */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Electricity Demand
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Historical Observed</span>
              <span className="text-slate-400">→</span>
              <span className="font-semibold text-blue-600">Deep Learning Multi-Step Forecast</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>1-Hour Timesteps</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Building #102 Meter</span>
            <button
              onClick={onNavigateToExplorer}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Open Full Explorer →
            </button>
          </div>
        </div>

        <div className="mt-4">
          <MainForecastChart
            data={timeSeriesData}
            thresholdKw={thresholdKw}
            selectedModel="both"
          />
        </div>
      </div>

      {/* Secondary Insights Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1 & 2: Today vs Yesterday and 7-Day Average */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Today's Energy Pattern
              </h3>
              <p className="text-xs text-slate-500">
                Comparative diurnal profile vs Yesterday and 7-Day Average baseline
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              15-min aggregation
            </span>
          </div>

          <div className="mt-4">
            <SecondaryTrendsChart />
          </div>
        </div>

        {/* Column 3: Facility Load Characteristics */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Facility Load Profile
              </h3>
              <p className="text-xs text-slate-500">
                Building #102 operational characteristics
              </p>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Baseline Night Load</span>
                <span className="font-mono font-semibold text-slate-900">312 kW</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Median Working Load</span>
                <span className="font-mono font-semibold text-slate-900">468 kW</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Peak-to-Base Ratio</span>
                <span className="font-mono font-semibold text-blue-600">1.88×</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Peak Window Concentration</span>
                <span className="font-medium text-slate-800">13:00 – 16:30</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Dominant Peak Driver</span>
                <span className="font-medium text-slate-800">Chilled Water & AHU</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900">
            <div className="flex items-center gap-1.5 font-semibold text-blue-800">
              <Zap className="h-3.5 w-3.5 text-blue-600" />
              <span>Energy Planning Note</span>
            </div>
            <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
              PowerPulse forecast indicates peak charge window starts at 13:00 tomorrow. Consider early thermal pre-cooling at 11:30.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
