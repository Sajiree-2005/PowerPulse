import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  secondaryText?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
    isWarning?: boolean;
  };
  icon?: LucideIcon;
  isPrimary?: boolean;
  badgeLabel?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit = 'kW',
  secondaryText,
  trend,
  icon: Icon,
  isPrimary = false,
  badgeLabel,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${
        isPrimary
          ? 'border-blue-200/90 bg-gradient-to-br from-white via-blue-50/20 to-blue-50/40 p-5 shadow-sm shadow-blue-500/5 hover:border-blue-300'
          : 'border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300'
      }`}
    >
      {/* Top row: Title and Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {title}
        </span>
        {badgeLabel && (
          <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5">
            {badgeLabel}
          </span>
        )}
        {Icon && !badgeLabel && (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isPrimary ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Main value display */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className={`font-mono text-3xl font-bold tracking-tight tabular-nums ${
            isPrimary ? 'text-slate-900' : 'text-slate-800'
          }`}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-slate-500">{unit}</span>
        )}
      </div>

      {/* Secondary text & Trend indicator */}
      <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
        {trend ? (
          <div className="flex items-center gap-1 font-medium">
            {trend.direction === 'up' ? (
              <ArrowUpRight
                className={`h-3.5 w-3.5 ${
                  trend.isWarning ? 'text-rose-600' : 'text-blue-600'
                }`}
              />
            ) : trend.direction === 'down' ? (
              <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
            ) : null}
            <span
              className={`font-mono tabular-nums ${
                trend.isWarning
                  ? 'text-rose-600 font-semibold'
                  : trend.direction === 'down'
                  ? 'text-emerald-700 font-semibold'
                  : 'text-slate-700'
              }`}
            >
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
            <span className="text-slate-400 font-normal">{trend.label}</span>
          </div>
        ) : (
          <span className="text-slate-500 font-medium">{secondaryText || 'Nominal baseline'}</span>
        )}
      </div>
    </div>
  );
};
