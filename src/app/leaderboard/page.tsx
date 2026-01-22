'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

type LeaderboardEntry = {
  username: string;
  first_name: string;
  total_points: number;
};

export default function LeaderboardPage() {
  const { user } = useTelegram();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data } = await supabase
        .from('profiles')
        .select('username, first_name, total_points')
        .order('total_points', { ascending: false })
        .limit(50);
      
      if (data) setLeaders(data);
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] p-6 pb-24 text-white relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-purple-900/20 to-transparent blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10 pt-2">
        <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} className="text-zinc-400" />
        </Link>
        <h1 className="text-xl font-bold uppercase tracking-wider">Global Elite</h1>
      </div>

      {/* Top 3 Graphic (Optional, simple list for now) */}
      
      {/* List */}
      <div className="space-y-2 relative z-10">
        {loading ? (
          [1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white/5 rounded-[20px] animate-pulse" />)
        ) : (
          leaders.map((entry, index) => {
            const isMe = user?.username === entry.username;
            const rank = index + 1;
            
            // Style for Top 3
            let rankStyle = "bg-white/5 border-white/5 text-zinc-400";
            let icon = null;
            if (rank === 1) { rankStyle = "bg-yellow-500/10 border-yellow-500/50 text-yellow-500"; icon = "👑"; }
            if (rank === 2) { rankStyle = "bg-zinc-300/10 border-zinc-300/50 text-zinc-300"; icon = "🥈"; }
            if (rank === 3) { rankStyle = "bg-orange-700/10 border-orange-700/50 text-orange-500"; icon = "🥉"; }

            return (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-[20px] border ${rankStyle} ${isMe ? 'ring-1 ring-white' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center font-black text-lg">
                    {icon || `#${rank}`}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isMe ? 'text-white' : 'text-zinc-200'}`}>
                      {entry.first_name || entry.username || 'Anonymous'} {isMe && '(You)'}
                    </p>
                  </div>
                </div>
                <div className="font-mono font-bold text-white">
                  {entry.total_points.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

    </main>
  );
}
