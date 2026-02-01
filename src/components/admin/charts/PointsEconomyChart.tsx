'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PointsBreakdown {
  reason: string;
  distributed: number;
}

interface PointsEconomyChartProps {
  data: PointsBreakdown[];
}

// Color palette for different reasons
const COLORS: Record<string, string> = {
  welcome_bonus: '#3b82f6',     // blue
  daily_spin: '#eab308',        // yellow
  wallet_connect: '#22c55e',    // green
  channel_join: '#8b5cf6',      // purple
  referral: '#f97316',          // orange
  daily_login: '#06b6d4',       // cyan
  prediction_win: '#ec4899',    // pink
  admin_adjustment: '#6b7280',  // gray
};

const DEFAULT_COLOR = '#eab308';

/**
 * Format reason string for display
 * e.g., "daily_spin" -> "Daily Spin"
 */
function formatReason(reason: string): string {
  return reason
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * PointsEconomyChart - Horizontal bar chart showing points distribution by reason
 *
 * Displays how points are distributed across different actions:
 * - Daily Spin, Wallet Connect, Referral, etc.
 *
 * Uses dark theme styling consistent with the app.
 */
export function PointsEconomyChart({ data }: PointsEconomyChartProps) {
  // Transform data with formatted names
  const chartData = data.map((item) => ({
    ...item,
    displayName: formatReason(item.reason),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
        <XAxis
          type="number"
          stroke="#666"
          tick={{ fill: '#999', fontSize: 12 }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          stroke="#666"
          tick={{ fill: '#999', fontSize: 12 }}
          width={75}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value) => [Number(value).toLocaleString(), 'Points']}
        />
        <Bar dataKey="distributed" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.reason] || DEFAULT_COLOR}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
