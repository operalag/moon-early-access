'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, Crown, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTelegram } from '@/hooks/useTelegram';

type LeaderboardEntry = {
  username: string | null;
  first_name: string | null;
  points: number;
  avatar_url?: string | null;
  rank: number;
  isCurrentUser?: boolean;
};

export default function LeaderboardPage() {
  const { user } = useTelegram();
  const [period, setPeriod] = useState<'all_time' | 'weekly' | 'daily'>('all_time');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const userParam = user?.id ? `&userId=${user.id}` : '';
        const res = await fetch(`/api/leaderboard?period=${period}${userParam}`);
        const json = await res.json();
        if (res.ok) {
          setData(json.leaderboard || []);
          setUserRank(json.userRank);
          setTotalUsers(json.totalUsers || 0);
        }
      } catch (e) {
        console.error('Leaderboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period, user]);

  const tabs = [
    { id: 'all_time', label: 'All Time' },
    { id: 'weekly', label: 'This Week' },
    { id: 'daily', label: 'Today' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] p-6 pb-24 text-white">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pt-4">
          <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-wider">Leaderboard</h1>
        </div>

        {/* User Rank Summary */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 uppercase font-bold tracking-wide">Your Rank</p>
                <p className="text-2xl font-black text-yellow-500">#{userRank}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/50 uppercase font-bold tracking-wide">Total Players</p>
                <p className="text-lg font-bold text-white/80">{totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-6 border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as any)}
              className="flex-1 relative py-2.5 text-xs font-bold uppercase tracking-wide text-center z-10"
            >
              {period === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-yellow-500 rounded-xl shadow-lg shadow-yellow-500/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span
                className={`relative transition-colors duration-200 ${
                  period === tab.id ? 'text-black' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-white/20">
              <Trophy size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm font-bold uppercase tracking-widest">No Champions Yet</p>
              <p className="text-xs mt-2">Be the first to score points in this period.</p>
            </div>
          ) : (
            data.map((entry, i) => {
              // Gap marker
              if (entry.rank === -1) {
                return (
                  <motion.div
                    key={`gap-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-2"
                  >
                    <div className="flex items-center gap-2 text-white/20">
                      <div className="w-8 h-px bg-white/10" />
                      <MoreHorizontal size={16} />
                      <div className="w-8 h-px bg-white/10" />
                    </div>
                  </motion.div>
                );
              }

              const rank = entry.rank;
              let RankIcon = null;
              if (rank === 1) RankIcon = <Crown size={20} className="text-yellow-400 fill-yellow-400" />;
              else if (rank === 2) RankIcon = <Medal size={20} className="text-zinc-300" />;
              else if (rank === 3) RankIcon = <Medal size={20} className="text-amber-700" />;

              const isMe = entry.isCurrentUser;

              return (
                <motion.div
                  key={`${entry.rank}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isMe
                      ? 'bg-yellow-500/20 border-yellow-500/50 ring-2 ring-yellow-500/30'
                      : rank === 1
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center font-black text-sm ${
                      rank <= 3 ? 'text-white' : isMe ? 'text-yellow-500' : 'text-zinc-500'
                    }`}
                  >
                    {RankIcon || rank}
                  </div>

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isMe ? 'bg-yellow-500/30 text-yellow-500' : 'bg-white/10 text-zinc-400'
                    }`}
                  >
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} className="w-full h-full rounded-full" alt="" />
                    ) : (
                      entry.first_name?.charAt(0) || '?'
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className={`font-bold text-sm ${
                        isMe ? 'text-yellow-500' : rank === 1 ? 'text-yellow-500' : 'text-white'
                      }`}
                    >
                      {entry.first_name || 'Anonymous'}
                      {isMe && <span className="ml-2 text-xs font-normal text-yellow-500/70">(You)</span>}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`font-black ${isMe ? 'text-yellow-500' : 'text-white'}`}>
                      {entry.points.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">pts</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
