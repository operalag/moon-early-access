'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DataPoint {
  date: string;
  total: number;
  cumulative: number;
}

interface UserGrowthChartProps {
  data: DataPoint[];
}

/**
 * UserGrowthChart - Line chart showing user acquisition over time
 *
 * Displays two lines:
 * - Cumulative: Total users up to that date (yellow)
 * - Daily: New users that day (green)
 *
 * Uses dark theme styling consistent with the app.
 */
export function UserGrowthChart({ data }: UserGrowthChartProps) {
  // Format date for display (MMM DD)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDateLabel = (value: any) => {
    const dateStr = String(value);
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateLabel}
          stroke="#666"
          tick={{ fill: '#999', fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#666"
          tick={{ fill: '#999', fontSize: 12 }}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          labelFormatter={formatDateLabel}
        />
        <Legend
          wrapperStyle={{ color: '#999' }}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          name="Total Users"
          stroke="#eab308"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#eab308' }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="New Users"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#22c55e' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
