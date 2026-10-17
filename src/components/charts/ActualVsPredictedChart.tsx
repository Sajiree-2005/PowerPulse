import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ActualVsPredictedPoint } from '../../types/energy';

interface ActualVsPredictedChartProps {
  data: ActualVsPredictedPoint[];
}

export const ActualVsPredictedChart: React.FC<ActualVsPredictedChartProps> = ({ data }) => {
  return (
    <div className="w-full">
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[280, 620]}
              tickFormatter={(v) => `${v} kW`}
              width={65}
            />
            <Tooltip
              formatter={(value: any, name: any) => [`${value} kW`, name]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#0f172a"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0f172a' }}
              name="Actual Observed"
            />
            <Line
              type="monotone"
              dataKey="lstmPred"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 2.5, fill: '#2563eb' }}
              name="LSTM Pred"
            />
            <Line
              type="monotone"
              dataKey="mlpPred"
              stroke="#059669"
              strokeWidth={1.8}
              strokeDasharray="4 2"
              dot={{ r: 2, fill: '#059669' }}
              name="MLP Pred"
            />
            <Line
              type="monotone"
              dataKey="baselinePred"
              stroke="#94a3b8"
              strokeWidth={1.2}
              strokeDasharray="3 3"
              dot={false}
              name="Lag-24h Baseline"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
