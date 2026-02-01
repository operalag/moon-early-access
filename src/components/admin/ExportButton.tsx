'use client';

import { CSVLink } from 'react-csv';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  headers?: { label: string; key: string }[];
  disabled?: boolean;
}

/**
 * Export Button Component
 *
 * Renders a CSV download button with the following features:
 * - Generates filename with current date
 * - Optional custom headers
 * - Disabled state for empty data
 * - Consistent dark theme styling
 */
export function ExportButton({ data, filename, headers, disabled }: ExportButtonProps) {
  const isEmpty = !data || data.length === 0;
  const isDisabled = disabled || isEmpty;

  // Generate filename with current date
  const exportFilename = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;

  if (isDisabled) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 bg-zinc-800 text-zinc-500 text-xs px-3 py-2 rounded-lg cursor-not-allowed opacity-50"
        title="No data to export"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export</span>
      </button>
    );
  }

  return (
    <CSVLink
      data={data}
      filename={exportFilename}
      headers={headers}
      className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Export</span>
    </CSVLink>
  );
}
