'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CohortData {
  cohort: string;
  d1: number;
  d7: number;
  d30: number;
  d1Pct: string;
  d7Pct: string;
  d30Pct: string;
}

interface RetentionChartProps {
  data: CohortData[];
}

/**
 * Retention curve chart showing D1/D7/D30 retention by cohort
 *
 * Displays three lines representing user retention at different time intervals
 * after signup, grouped by weekly cohorts.
 */
export function RetentionChart({ data }: RetentionChartProps) {
  // Transform data to numeric percentages for charting
  const chartData = data.map((item) => ({
    cohort: item.cohort,
    D1: item.d1Pct !== 'N/A' ? parseFloat(item.d1Pct) : null,
    D7: item.d7Pct !== 'N/A' ? parseFloat(item.d7Pct) : null,
    D30: item.d30Pct !== 'N/A' ? parseFloat(item.d30Pct) : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="cohort"
          stroke="#71717a"
          tick={{ fill: '#a1a1aa', fontSize: 11 }}
          axisLine={{ stroke: '#3f3f46' }}
        />
        <YAxis
          domain={[0, 100]}
          stroke="#71717a"
          tick={{ fill: '#a1a1aa', fontSize: 11 }}
          axisLine={{ stroke: '#3f3f46' }}
          tickFormatter={(value: number) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            color: '#fff',
          }}
          labelStyle={{ color: '#a1a1aa' }}
          formatter={(value) => (value !== null && value !== undefined ? [`${value}%`, ''] : ['N/A', ''])}
        />
        <Legend
          wrapperStyle={{ color: '#a1a1aa' }}
        />
        <Line
          type="monotone"
          dataKey="D1"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="D7"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: '#8b5cf6', r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="D30"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: '#22c55e', r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
