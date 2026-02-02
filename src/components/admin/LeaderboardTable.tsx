'use client';

import { ExportButton } from '@/components/admin/ExportButton';

interface LeaderboardEntry {
  rank: number;
  first_name: string;
  username: string | null;
  wallet_address: string | null;
  points: number;
}

interface LeaderboardTableProps {
  title: string;
  data: LeaderboardEntry[];
  filename: string;
}

const csvHeaders = [
  { label: 'Rank', key: 'rank' },
  { label: 'Name', key: 'first_name' },
  { label: 'Username', key: 'username' },
  { label: 'Wallet Address', key: 'wallet_address' },
  { label: 'Points', key: 'points' },
];

/**
 * LeaderboardTable - Displays a single leaderboard with export functionality
 *
 * Features:
 * - Medal styling for top 3 (gold, silver, bronze)
 * - Truncated wallet addresses
 * - Initial avatars
 * - CSV export with full wallet addresses
 */
export function LeaderboardTable({ title, data, filename }: LeaderboardTableProps) {
  const medalColors: { [key: number]: string } = {
    1: 'bg-yellow-500', // Gold
    2: 'bg-zinc-400',   // Silver
    3: 'bg-amber-600',  // Bronze
  };

  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const truncateWallet = (address: string | null): string => {
    if (!address) return 'Not connected';
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Prepare export data with "Not connected" for null wallets
  const exportData = data.map((entry) => ({
    ...entry,
    username: entry.username || '-',
    wallet_address: entry.wallet_address || 'Not connected',
  }));

  if (data.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <ExportButton data={[]} filename={filename} headers={csvHeaders} />
        </div>
        <div className="text-center text-zinc-500 py-8">
          No data for this period
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <ExportButton data={exportData} filename={filename} headers={csvHeaders} />
      </div>
      <div className="space-y-2">
        {data.map((entry) => {
          const isMedal = entry.rank <= 3;

          return (
            <div
              key={`${entry.rank}-${entry.first_name}`}
              className="flex items-center gap-3 py-2 px-3 bg-zinc-800/50 rounded-lg"
            >
              {/* Rank Badge */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isMedal
                    ? `${medalColors[entry.rank]} text-black`
                    : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {entry.rank}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                {getInitial(entry.first_name)}
              </div>

              {/* Name & Username */}
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm truncate">
                  {entry.first_name}
                </div>
                <div className="text-zinc-500 text-xs truncate">
                  {entry.username ? `@${entry.username}` : '-'}
                </div>
              </div>

              {/* Wallet */}
              <div className="text-zinc-400 text-xs font-mono flex-shrink-0 hidden sm:block">
                {truncateWallet(entry.wallet_address)}
              </div>

              {/* Points */}
              <div className="text-white text-sm font-medium flex-shrink-0">
                {entry.points.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
