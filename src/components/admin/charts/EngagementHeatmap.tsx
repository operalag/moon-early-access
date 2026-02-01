'use client';

import HeatMap from '@uiw/react-heat-map';
import { subDays, format } from 'date-fns';

interface EngagementData {
  date: string;
  count: number;
}

interface EngagementHeatmapProps {
  data: EngagementData[];
}

/**
 * GitHub-style activity heatmap for user engagement
 *
 * Displays daily activity levels over the last 90 days
 * using a color scale from dark (no activity) to bright green (high activity)
 */
export function EngagementHeatmap({ data }: EngagementHeatmapProps) {
  // Calculate date range
  const endDate = new Date();
  const startDate = subDays(endDate, 89);

  // Transform data for HeatMap component
  const heatmapData = data.map((item) => ({
    date: item.date,
    count: item.count,
  }));

  return (
    <div className="overflow-x-auto pb-2">
      <HeatMap
        value={heatmapData}
        startDate={startDate}
        endDate={endDate}
        width="100%"
        rectSize={12}
        space={3}
        rectProps={{
          rx: 2,
        }}
        weekLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
        monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
        panelColors={{
          0: '#161b22',
          2: '#0e4429',
          4: '#006d32',
          8: '#26a641',
          12: '#39d353',
        }}
        style={{
          color: '#a1a1aa',
        }}
        rectRender={(props, data) => {
          const dateStr = data.date ? format(new Date(data.date), 'MMM d, yyyy') : '';
          const count = data.count || 0;
          return (
            <rect
              {...props}
              data-tip={`${dateStr}: ${count} activities`}
            />
          );
        }}
      />
    </div>
  );
}
