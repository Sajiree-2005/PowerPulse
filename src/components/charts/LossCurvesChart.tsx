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
import { TrainingLossPoint } from '../../types/energy';

interface LossCurvesChartProps {
  data: TrainingLossPoint[];
}

export const LossCurvesChart: React.FC<LossCurvesChartProps> = ({ data }) => {
  return (
    <div className="w-full">
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="epoch"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(ep) => `Ep ${ep}`}
              minTickGap={20}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0.05, 1.05]}
              tickFormatter={(v) => v.toFixed(2)}
              width={50}
            />
            <Tooltip
              formatter={(value: any, name: any) => [Number(value).toFixed(4), name]}
              labelFormatter={(label) => `Epoch ${label}`}
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
              dataKey="lstmTrainLoss"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name="LSTM Train (MSE)"
            />
            <Line
              type="monotone"
              dataKey="lstmValLoss"
              stroke="#60a5fa"
              strokeWidth={1.8}
              strokeDasharray="4 2"
              dot={false}
              name="LSTM Val (MSE)"
            />
            <Line
              type="monotone"
              dataKey="mlpTrainLoss"
              stroke="#059669"
              strokeWidth={1.8}
              dot={false}
              name="MLP Train (MSE)"
            />
            <Line
              type="monotone"
              dataKey="mlpValLoss"
              stroke="#34d399"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              name="MLP Val (MSE)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
