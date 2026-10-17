import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const SecondaryTrendsChart: React.FC = () => {
  // 24-hour comparative pattern: Today vs Yesterday vs 7-Day Average
  const comparisonData = [
    { hour: '00:00', today: 320, yesterday: 312, avg7d: 318 },
    { hour: '03:00', today: 308, yesterday: 304, avg7d: 310 },
    { hour: '06:00', today: 364, yesterday: 350, avg7d: 355 },
    { hour: '09:00', today: 478, yesterday: 462, avg7d: 468 },
    { hour: '12:00', today: 488, yesterday: 475, avg7d: 482 },
    { hour: '14:00', today: 562, yesterday: 540, avg7d: 538 },
    { hour: '15:00', today: 548, yesterday: 528, avg7d: 530 },
    { hour: '18:00', today: 428, yesterday: 412, avg7d: 416 },
    { hour: '21:00', today: 350, yesterday: 345, avg7d: 348 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 p-2.5 text-xs shadow-md">
        <div className="font-semibold text-slate-800 mb-1">{label}</div>
        <div className="space-y-1">
          <div className="flex justify-between gap-3 text-blue-700 font-medium">
            <span>Today:</span>
            <span className="font-mono font-bold">{payload[0]?.value} kW</span>
          </div>
          <div className="flex justify-between gap-3 text-slate-500">
            <span>Yesterday:</span>
            <span className="font-mono">{payload[1]?.value} kW</span>
          </div>
          <div className="flex justify-between gap-3 text-slate-400">
            <span>7-Day Mean:</span>
            <span className="font-mono">{payload[2]?.value} kW</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[280, 600]}
              tickFormatter={(v) => `${v}`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="today"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#todayGrad)"
            />
            <Area
              type="monotone"
              dataKey="yesterday"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              fill="none"
            />
            <Area
              type="monotone"
              dataKey="avg7d"
              stroke="#cbd5e1"
              strokeWidth={1}
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-slate-700 font-medium">Today</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-xs bg-slate-400" />
            <span>Yesterday</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-xs bg-slate-300" />
            <span>7-Day Avg</span>
          </span>
        </div>
        <span className="font-mono text-blue-700 font-semibold">+3.9% vs 7d</span>
      </div>
    </div>
  );
};
