'use client';

import { RefreshCw } from 'lucide-react';
import { DateRangePicker, DateRange } from './DateRangePicker';
import { format } from 'date-fns';

interface DashboardHeaderProps {
  title: string;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

/**
 * Dashboard Header Component
 *
 * Displays dashboard title, last updated timestamp, refresh button, and date range picker.
 * Responsive layout: stacks on mobile, row on large screens.
 */
export function DashboardHeader({
  title,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  dateRange,
  onDateRangeChange,
}: DashboardHeaderProps) {
  const formatTime = (date: Date): string => {
    return format(date, 'HH:mm:ss');
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
      {/* Title and Last Updated */}
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-zinc-500 text-xs">
            Last updated: {lastUpdated ? formatTime(lastUpdated) : 'Never'}
          </p>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-1 text-zinc-400 hover:text-white transition-colors ${
              isRefreshing ? 'cursor-not-allowed' : ''
            }`}
            title="Refresh data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
          <span className="text-zinc-600 text-xs">(auto-refresh: 60s)</span>
        </div>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
    </div>
  );
}
