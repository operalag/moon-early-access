'use client';

import { subDays, startOfDay, endOfDay } from 'date-fns';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

type PresetKey = '7d' | '30d' | '90d' | 'all';

interface Preset {
  key: PresetKey;
  label: string;
  getRange: () => DateRange;
}

/**
 * Date Range Picker Component
 *
 * Provides preset date range buttons for quick filtering:
 * - Last 7 days
 * - Last 30 days
 * - Last 90 days
 * - All time
 *
 * Compact design for mobile with text-xs buttons.
 */
export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const presets: Preset[] = [
    {
      key: '7d',
      label: '7d',
      getRange: () => ({
        from: startOfDay(subDays(new Date(), 6)),
        to: endOfDay(new Date()),
      }),
    },
    {
      key: '30d',
      label: '30d',
      getRange: () => ({
        from: startOfDay(subDays(new Date(), 29)),
        to: endOfDay(new Date()),
      }),
    },
    {
      key: '90d',
      label: '90d',
      getRange: () => ({
        from: startOfDay(subDays(new Date(), 89)),
        to: endOfDay(new Date()),
      }),
    },
    {
      key: 'all',
      label: 'All',
      getRange: () => ({
        // All time: from earliest possible date to now
        from: new Date(2020, 0, 1),
        to: endOfDay(new Date()),
      }),
    },
  ];

  // Determine which preset is currently active based on the value
  const getActivePreset = (): PresetKey | null => {
    const now = endOfDay(new Date());
    const daysDiff = Math.round((now.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 7) return '7d';
    if (daysDiff <= 30) return '30d';
    if (daysDiff <= 90) return '90d';
    return 'all';
  };

  const activePreset = getActivePreset();

  return (
    <div className="flex gap-1.5">
      {presets.map((preset) => (
        <button
          key={preset.key}
          onClick={() => onChange(preset.getRange())}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activePreset === preset.key
              ? 'bg-yellow-500 text-black'
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
