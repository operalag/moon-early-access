'use client';

interface ReferralSummary {
  total_referrals: number;
  unique_referrers: number;
  avg_per_referrer: number;
}

interface TopReferrer {
  referrer_id: number;
  referrer_name: string;
  count: number;
}

interface ReferralStatsProps {
  summary: ReferralSummary;
  topReferrers: TopReferrer[];
}

/**
 * ReferralStats - Displays referral network summary and top referrers leaderboard
 *
 * Shows key metrics at top and a ranked list of top 10 referrers below.
 * Top 3 get special medal styling (gold, silver, bronze).
 */
export function ReferralStats({ summary, topReferrers }: ReferralStatsProps) {
  const medalColors: { [key: number]: string } = {
    1: 'bg-yellow-500', // Gold
    2: 'bg-zinc-400',   // Silver
    3: 'bg-amber-600',  // Bronze
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (summary.total_referrals === 0 && topReferrers.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-8">
        No referrals yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">
            Total Referrals
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {summary.total_referrals.toLocaleString()}
          </div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">
            Referrers
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {summary.unique_referrers.toLocaleString()}
          </div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">
            Avg/Referrer
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {summary.avg_per_referrer.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Top Referrers Leaderboard */}
      {topReferrers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            Top Referrers
          </h3>
          <div className="space-y-2">
            {topReferrers.map((referrer, index) => {
              const rank = index + 1;
              const isMedal = rank <= 3;

              return (
                <div
                  key={referrer.referrer_id}
                  className="flex items-center gap-3 py-2 px-3 bg-zinc-800/50 rounded-lg"
                >
                  {/* Rank */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isMedal
                        ? `${medalColors[rank]} text-black`
                        : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-white">
                    {getInitial(referrer.referrer_name)}
                  </div>

                  {/* Name */}
                  <div className="flex-1 text-white text-sm truncate">
                    {referrer.referrer_name}
                  </div>

                  {/* Count */}
                  <div className="text-zinc-400 text-sm font-medium">
                    {referrer.count} referral{referrer.count !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
