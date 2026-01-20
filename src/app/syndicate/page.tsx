'use client';

import { useTelegram } from "@/hooks/useTelegram";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Referral {
  created_at: string;
  profiles: {
    first_name: string;
    username: string;
  };
}

export default function SyndicatePage() {
  const { user, webApp } = useTelegram();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  // REPLACE THIS WITH YOUR ACTUAL BOT USERNAME
  const BOT_USERNAME = "MoonPredictionBot"; 

  useEffect(() => {
    async function fetchReferrals() {
      if (!user) return;
      
      // Fetch users who were referred by the current user
      // Note: This requires a join on the 'profiles' table via 'referee_id'
      // Ideally, we'd adjust the query, but for now let's just count them 
      // or fetch raw data. 
      
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          created_at,
          profiles!referee_id (first_name, username)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setReferrals(data as any);
      }
      setLoading(false);
    }

    fetchReferrals();
  }, [user]);

  const handleInvite = () => {
    if (!user || !webApp) return;
    
    const inviteLink = `https://t.me/${BOT_USERNAME}/app?startapp=${user.id}`;
    const message = `Join me on MOON and trade your cricket knowledge! 🏏 Get 1,000 points instantly.`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`;
    
    webApp.openTelegramLink(url);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-black text-white">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold uppercase tracking-wider">My Syndicate</h1>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-3xl p-6 mb-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-white font-bold text-lg mb-2">GROW YOUR NETWORK</h2>
            <p className="text-yellow-100 text-sm mb-6">Earn <span className="font-bold text-white">500 Points</span> for every friend you recruit.</p>
            
            <button 
              onClick={handleInvite}
              className="w-full bg-white text-yellow-900 font-black py-4 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <span>INVITE FRIENDS</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </button>
          </div>
          
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center">
            <p className="text-zinc-500 text-xs uppercase font-bold">Total Recruits</p>
            <p className="text-3xl font-black text-white">{referrals.length}</p>
          </div>
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center">
            <p className="text-zinc-500 text-xs uppercase font-bold">Points Earned</p>
            <p className="text-3xl font-black text-yellow-500">{(referrals.length * 500).toLocaleString()}</p>
          </div>
        </div>

        {/* Recruit List */}
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 min-h-[300px]">
          <h3 className="text-zinc-400 text-sm font-bold uppercase mb-4 tracking-widest">Recent Recruits</h3>
          
          {loading ? (
            <div className="text-center text-zinc-600 py-8">Loading data...</div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">👻</div>
              <p className="text-zinc-500 text-sm">Your syndicate is empty.</p>
              <p className="text-zinc-600 text-xs mt-1">Start inviting to see names here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((ref, i) => (
                <div key={i} className="flex justify-between items-center border-b border-zinc-800 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {ref.profiles?.first_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{ref.profiles?.first_name || 'Anonymous'}</p>
                      <p className="text-xs text-zinc-600">@{ref.profiles?.username || 'unknown'}</p>
                    </div>
                  </div>
                  <span className="text-yellow-500 font-bold text-xs">+500 pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
