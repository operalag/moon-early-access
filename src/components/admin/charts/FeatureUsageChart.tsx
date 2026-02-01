'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FeatureData {
  feature: string;
  users: number;
}

interface FeatureUsageChartProps {
  data: FeatureData[];
}

// Color palette for pie slices
const COLORS = ['#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899'];

/**
 * Feature usage pie chart showing adoption breakdown
 *
 * Displays the distribution of users across different features
 * with percentage labels and a color-coded legend.
 */
export function FeatureUsageChart({ data }: FeatureUsageChartProps) {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.users, 0);

  // Add percentage to data
  const chartData = data.map((item) => ({
    ...item,
    percentage: total > 0 ? ((item.users / total) * 100).toFixed(1) : '0.0',
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
          dataKey="users"
          nameKey="feature"
          label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
          labelLine={{ stroke: '#71717a' }}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            color: '#fff',
          }}
          formatter={(value, name) => [
            `${Number(value).toLocaleString()} users`,
            String(name),
          ]}
        />
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value: string) => (
            <span style={{ color: '#a1a1aa' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
