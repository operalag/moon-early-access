'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
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
const COLORS = ['#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#06b6d4', '#f43f5e'];

/**
 * Feature usage pie chart with toggleable features
 *
 * Displays the distribution of users across different features
 * with checkboxes to toggle each feature on/off.
 */
export function FeatureUsageChart({ data }: FeatureUsageChartProps) {
  // Track which features are enabled (all enabled by default)
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(new Set());

  // Initialize enabled features when data changes
  useEffect(() => {
    setEnabledFeatures(new Set(data.map((item) => item.feature)));
  }, [data]);

  // Toggle a feature on/off
  const toggleFeature = (feature: string) => {
    setEnabledFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(feature)) {
        // Don't allow disabling all features
        if (next.size > 1) {
          next.delete(feature);
        }
      } else {
        next.add(feature);
      }
      return next;
    });
  };

  // Filter data based on enabled features
  const filteredData = data.filter((item) => enabledFeatures.has(item.feature));

  // Calculate total for percentages
  const total = filteredData.reduce((sum, item) => sum + item.users, 0);

  // Map feature to its original color index for consistency
  const featureColorMap = new Map<string, number>();
  data.forEach((item, index) => {
    featureColorMap.set(item.feature, index);
  });

  return (
    <div>
      {/* Feature Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {data.map((item) => {
          const colorIndex = featureColorMap.get(item.feature) || 0;
          const isEnabled = enabledFeatures.has(item.feature);
          return (
            <button
              key={item.feature}
              onClick={() => toggleFeature(item.feature)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${isEnabled
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 opacity-50'
                }
              `}
            >
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: isEnabled ? COLORS[colorIndex % COLORS.length] : '#3f3f46' }}
              />
              {item.feature}
            </button>
          );
        })}
      </div>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            dataKey="users"
            nameKey="feature"
            label={({ name, percent }) =>
              `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
            }
            labelLine={{ stroke: '#71717a' }}
          >
            {filteredData.map((entry) => {
              const colorIndex = featureColorMap.get(entry.feature) || 0;
              return (
                <Cell
                  key={`cell-${entry.feature}`}
                  fill={COLORS[colorIndex % COLORS.length]}
                />
              );
            })}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value, name) => [
              `${Number(value).toLocaleString()} users (${total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`,
              String(name),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="text-center text-zinc-500 text-xs mt-2">
        Showing {filteredData.length} of {data.length} features • {total.toLocaleString()} total users
      </div>
    </div>
  );
}
