'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

type LeaderboardEntry = {
  username: string;
  first_name: string;
  points: number;
  avatar_url?: string;
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'all_time' | 'weekly' | 'daily'>('all_time');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?period=${period}`);
        const json = await res.json();
        if (res.ok) {
            setData(json.leaderboard || []);
        }
      } catch (e) {
        console.error("Leaderboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

  const tabs = [
    { id: 'all_time', label: 'All Time' },
    { id: 'weekly', label: 'This Week' },
    { id: 'daily', label: 'Today' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] p-6 pb-24 text-white">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-wider">Leaderboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/10">
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
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className={`relative transition-colors duration-200 ${period === tab.id ? 'text-black' : 'text-zinc-500 hover:text-white'}`}>
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
             // Skeleton
             [1,2,3,4,5].map(i => (
                 <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
             ))
          ) : data.length === 0 ? (
             <div className="text-center py-12 text-white/20">
                 <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                 <p className="text-sm font-bold uppercase tracking-widest">No Champions Yet</p>
                 <p className="text-xs mt-2">Be the first to score points in this period.</p>
             </div>
          ) : (
             data.map((user, i) => {
                const rank = i + 1;
                let RankIcon = null;
                if (rank === 1) RankIcon = <Crown size={20} className="text-yellow-400 fill-yellow-400" />;
                else if (rank === 2) RankIcon = <Medal size={20} className="text-zinc-300" />;
                else if (rank === 3) RankIcon = <Medal size={20} className="text-amber-700" />;

                return (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border ${
                            rank === 1 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/5'
                        }`}
                    >
                        <div className={`w-8 h-8 flex items-center justify-center font-black text-sm ${
                            rank <= 3 ? 'text-white' : 'text-zinc-500'
                        }`}>
                            {RankIcon || rank}
                        </div>
                        
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-zinc-400">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} className="w-full h-full rounded-full" />
                            ) : (
                                user.first_name?.charAt(0)
                            )}
                        </div>

                        <div className="flex-1">
                            <p className={`font-bold text-sm ${rank === 1 ? 'text-yellow-500' : 'text-white'}`}>
                                {user.first_name}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="font-black text-white">{user.points.toLocaleString()}</p>
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
