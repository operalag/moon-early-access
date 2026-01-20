'use client';

import AuthWrapper from "@/components/AuthWrapper";
import { useTelegram } from "@/hooks/useTelegram";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import DailyLoginCard from "@/components/DailyLoginCard";

function Dashboard() {
  const { user } = useTelegram();
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPoints() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('telegram_id', user.id)
        .single();
      
      if (data) setPoints(data.total_points);
    }
    fetchPoints();
  }, [user]);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-black">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tighter text-white">
            MOON<span className="text-yellow-500">.</span>
          </h1>
          <div className="bg-zinc-900 px-4 py-1 rounded-full border border-zinc-800">
            <span className="text-sm font-medium text-zinc-400">Phase: </span>
            <span className="text-sm font-bold text-yellow-500 uppercase tracking-widest">Early Access</span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black text-xl font-bold">
              {user?.first_name?.charAt(0) || 'M'}
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Welcome back, analyst</p>
              <h2 className="text-xl font-bold">{user?.first_name || 'Guest'}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-xs uppercase font-semibold mb-1">Strategy Points</p>
              <p className="text-2xl font-black text-yellow-500">{points?.toLocaleString() || '1,000'}</p>
            </div>
            <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-xs uppercase font-semibold mb-1">Global Rank</p>
              <p className="text-2xl font-black text-white">#--</p>
            </div>
          </div>
        </div>
        
        {/* Daily Login Section */}
        <DailyLoginCard />

        {/* CTA Section */}
        <div className="space-y-4">
          <Link href="/syndicate" className="block w-full">
            <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-2xl transition-all active:scale-95">
              BUILD YOUR SYNDICATE
            </button>
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/spin" className="block w-full">
              <button className="w-full h-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl border border-zinc-800 transition-all">
                VOLATILITY SPIN
              </button>
            </Link>
            <Link href="/wallet" className="block w-full">
              <button className="w-full h-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl border border-zinc-800 transition-all">
                VERIFY ASSETS
              </button>
            </Link>
          </div>
        </div>

        {/* Event News */}
        <div className="mt-10">
          <h3 className="text-zinc-400 text-sm font-bold uppercase mb-4 tracking-widest">Upcoming Markets</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex gap-4 items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xs italic">ICC</div>
            <div>
              <p className="font-bold text-sm">World Cup 2026: India vs Pakistan</p>
              <p className="text-xs text-zinc-500 font-medium">Opening in 482 days</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  );
}