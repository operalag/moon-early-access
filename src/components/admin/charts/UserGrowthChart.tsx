'use client';

import { useState, useMemo } from 'react';
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

type TimeframeOption = '7d' | '14d' | '30d' | '90d' | 'all';

const TIMEFRAME_OPTIONS: { value: TimeframeOption; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
];

/**
 * UserGrowthChart - Line chart showing user acquisition over time
 *
 * Displays two lines:
 * - Cumulative: Total users up to that date (yellow)
 * - Daily: New users that day (green)
 *
 * Includes timeframe selector to view different periods.
 */
export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('30d');

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (timeframe === 'all' || data.length === 0) {
      return data;
    }

    const days = parseInt(timeframe.replace('d', ''), 10);
    return data.slice(-days);
  }, [data, timeframe]);

  // Calculate summary stats for the filtered period
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { newUsers: 0, startUsers: 0, endUsers: 0 };

    const newUsers = filteredData.reduce((sum, d) => sum + d.total, 0);
    const startUsers = filteredData[0]?.cumulative - filteredData[0]?.total || 0;
    const endUsers = filteredData[filteredData.length - 1]?.cumulative || 0;

    return { newUsers, startUsers, endUsers };
  }, [filteredData]);

  // Format date for display (MMM DD)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDateLabel = (value: any) => {
    const dateStr = String(value);
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {TIMEFRAME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                ${timeframe === option.value
                  ? 'bg-yellow-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Period Stats */}
        <div className="text-xs text-zinc-500">
          <span className="text-green-400">+{stats.newUsers.toLocaleString()}</span> new users
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={filteredData}
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
    </div>
  );
}
