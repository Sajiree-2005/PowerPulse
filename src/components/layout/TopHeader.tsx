import React from 'react';
import { Menu, RefreshCw, SlidersHorizontal, Activity } from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopHeaderProps {
  activeTab: NavTab;
  onOpenMobileSidebar: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  thresholdKw: number;
  onNavigateToAlerts?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onRefreshData,
  isRefreshing = false,
  thresholdKw,
  onNavigateToAlerts,
}) => {
  const getTabLabel = (tab: NavTab) => {
    switch (tab) {
      case 'overview':
        return 'Overview';
      case 'explorer':
        return 'Forecast Explorer';
      case 'comparison':
        return 'Model Comparison';
      case 'alerts':
        return 'Peak Demand Early Warning';
      case 'status':
        return 'Data & System Status';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Zone 1: Mobile toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-medium text-slate-400">Building #102</span>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="font-semibold text-slate-900">{getTabLabel(activeTab)}</span>
        </nav>
      </div>

      {/* Zone 2: Live status text (quiet metadata, no pill sandwich) */}
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          Live Telemetry
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>15-min Ingestion</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="font-mono text-slate-600">Updated 18:00</span>
      </div>

      {/* Zone 3: Primary Action & Quick Threshold Indicator */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onNavigateToAlerts}
          title="Threshold Configuration"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
          <span>Threshold:</span>
          <span className="font-mono font-semibold text-slate-900">{thresholdKw} kW</span>
        </button>

        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Telemetry</span>
          <span className="sm:hidden">Sync</span>
        </button>
      </div>
    </header>
  );
};
