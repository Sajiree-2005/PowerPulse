import React from 'react';
import {
  Zap,
  LayoutDashboard,
  TrendingUp,
  Cpu,
  AlertTriangle,
  Server,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';

export type NavTab = 'overview' | 'explorer' | 'comparison' | 'alerts' | 'status';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  alertCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  alertCount = 3,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      group: 'DASHBOARD',
      items: [
        { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'explorer' as NavTab, label: 'Forecast Explorer', icon: TrendingUp },
        { id: 'comparison' as NavTab, label: 'Model Comparison', icon: Cpu },
        {
          id: 'alerts' as NavTab,
          label: 'Alerts',
          icon: AlertTriangle,
          badgeCount: alertCount,
        },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'status' as NavTab, label: 'Data & System Status', icon: Server },
      ],
    },
  ];

  const handleSelect = (tab: NavTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/90 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Zap className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-slate-900 text-lg">PowerPulse</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Energy Demand Intelligence</p>
          </div>
        </div>

        {/* Building Selector Pill/Chip */}
        <div className="mx-4 mt-4 rounded-lg border border-slate-200/70 bg-slate-50/80 p-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Active Facility</span>
            <span className="text-[11px] font-mono text-blue-600 font-semibold">85,400 sq ft</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-slate-800">Building #102</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-white border border-slate-200 rounded px-1.5 py-0.5">
              ASHRAE
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto">
          {navItems.map((group) => (
            <div key={group.group}>
              <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-600">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </div>

                      {item.badgeCount !== undefined && item.badgeCount > 0 ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-bold text-white shadow-xs">
                          {item.badgeCount}
                        </span>
                      ) : (
                        isActive && (
                          <ChevronRight className="h-4 w-4 text-blue-500 opacity-60" />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System Status Indicators at the bottom */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              API Online
            </span>
            <span className="font-mono text-[11px] text-slate-400">FastAPI ready</span>
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-blue-100" />
              Models Ready
            </span>
            <span className="font-mono text-[11px] text-slate-400">LSTM · MLP</span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>PowerPulse v1.2</span>
            <span>Local 18:00</span>
          </div>
        </div>
      </aside>
    </>
  );
};
