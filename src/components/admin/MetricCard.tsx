'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

/**
 * MetricCard - Displays a single metric with optional trend indicator
 *
 * Used in the admin dashboard to show key statistics like
 * total users, wallets connected, points distributed, etc.
 */
export function MetricCard({ title, value, change, trend = 'neutral' }: MetricCardProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-zinc-500',
  };

  const trendArrows = {
    up: '\u2191',
    down: '\u2193',
    neutral: '',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wider">
        {title}
      </div>
      <div className="text-2xl font-bold text-white mt-1">
        {value}
      </div>
      {change && (
        <div className={`text-xs mt-1 ${trendColors[trend]}`}>
          {trendArrows[trend]} {change}
        </div>
      )}
    </div>
  );
}
