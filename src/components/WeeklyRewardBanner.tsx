'use client';

import { useEffect, useState } from 'react';
import { Trophy, Lock, Info } from 'lucide-react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useTelegram } from '@/hooks/useTelegram';
import { useInfo } from '@/context/InfoContext';

interface RankData {
  weeklyRank: number | null;
  weeklyPoints: number;
  isInTop10: boolean;
}

const INFO_TITLE = 'Weekly Leaderboard Rewards';
const INFO_CONTENT = `Top 10 users in the weekly leaderboard receive jettons on TON every week.

Use jettons to play early access prediction markets.

Winners evaluated: Sunday, 12:00 PM IST
Check your wallet on Sundays!

Eligibility: TON wallet must be connected`;

export default function WeeklyRewardBanner() {
  const { user } = useTelegram();
  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { openInfo } = useInfo();
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [loading, setLoading] = useState(true);

  const isWalletConnected = !!userFriendlyAddress;

  useEffect(() => {
    async function fetchRank() {
      if (!user) return;

      try {
        const res = await fetch(`/api/leaderboard/my-rank?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setRankData(data);
        }
      } catch (error) {
        console.error('Failed to fetch rank:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRank();
  }, [user]);

  const handleConnectWallet = () => {
    tonConnectUI.openModal();
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openInfo(INFO_TITLE, INFO_CONTENT);
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 animate-pulse">
        <div className="h-16 bg-white/5 rounded-xl" />
      </div>
    );
  }

  // Wallet Connected State
  if (isWalletConnected) {
    const rankDisplay = rankData?.weeklyRank ? `#${rankData.weeklyRank}` : 'Unranked';

    return (
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-[24px] p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-yellow-500/20 text-yellow-500">
              <Trophy size={24} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">You&apos;re eligible for weekly rewards!</p>
              <p className="text-[11px] text-white/50 mt-0.5">
                Current rank: <span className="text-yellow-500 font-semibold">{rankDisplay}</span> — Top 10 wins jettons
              </p>
            </div>
          </div>
          <button
            onClick={handleInfoClick}
            className="p-1 text-white/30 hover:text-yellow-500 transition-colors"
          >
            <Info size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Wallet NOT Connected State
  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-zinc-700/50 text-zinc-400">
            <Lock size={24} />
          </div>
          <div>
            <p className="font-bold text-sm text-white/80">Connect wallet to win weekly rewards</p>
            <p className="text-[11px] text-white/40 mt-0.5">Top 10 earns jettons every week</p>
          </div>
        </div>
        <button
          onClick={handleInfoClick}
          className="p-1 text-white/30 hover:text-yellow-500 transition-colors"
        >
          <Info size={18} />
        </button>
      </div>
      <button
        onClick={handleConnectWallet}
        className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl active:scale-95 transition-transform"
      >
        Connect Wallet
      </button>
    </div>
  );
}
