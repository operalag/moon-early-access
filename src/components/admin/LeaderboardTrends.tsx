'use client';

interface TrendData {
  telegram_id: number;
  name: string;
  current_rank: number;
  previous_rank: number;
  change: number;
}

interface LeaderboardTrendsProps {
  trends: TrendData[];
}

/**
 * LeaderboardTrends - Shows top movers in leaderboard positions
 *
 * Displays users with the biggest rank changes over the last 7 days.
 * Positive changes (moving up) shown in green, negative in red.
 */
export function LeaderboardTrends({ trends }: LeaderboardTrendsProps) {
  if (!trends || trends.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-8">
        No movement data yet
      </div>
    );
  }

  const getChangeDisplay = (change: number) => {
    if (change > 0) {
      return {
        icon: '\u2191',
        text: `+${change}`,
        colorClass: 'text-green-500',
      };
    } else if (change < 0) {
      return {
        icon: '\u2193',
        text: `${change}`,
        colorClass: 'text-red-500',
      };
    }
    return {
      icon: '-',
      text: '0',
      colorClass: 'text-zinc-500',
    };
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-3">
      {trends.map((mover, index) => {
        const { icon, text, colorClass } = getChangeDisplay(mover.change);

        return (
          <div
            key={mover.telegram_id}
            className="flex items-center gap-3 py-2 px-3 bg-zinc-800/50 rounded-lg"
          >
            {/* Movement Indicator */}
            <div className={`flex items-center gap-1 min-w-[60px] ${colorClass}`}>
              <span className="text-lg font-bold">{icon}</span>
              <span className="font-semibold">{text}</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-white">
              {getInitial(mover.name)}
            </div>

            {/* Name */}
            <div className="flex-1 text-white text-sm truncate">
              {mover.name}
            </div>

            {/* Current Rank */}
            <div className="text-zinc-400 text-sm">
              Rank #{mover.current_rank}
            </div>

            {/* Previous Rank (smaller) */}
            <div className="text-zinc-600 text-xs">
              (was #{mover.previous_rank})
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-500 text-center">
        Position changes over last 7 days
      </div>
    </div>
  );
}
