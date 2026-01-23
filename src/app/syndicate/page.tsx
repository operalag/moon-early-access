'use client';

import { useTelegram } from "@/hooks/useTelegram";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, Users, Share2, Copy } from "lucide-react";
import InfoTrigger from "@/components/ui/InfoTrigger";
import { motion } from "framer-motion";

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

  const BOT_USERNAME = "MoonPredictionBot"; 

  useEffect(() => {
    async function fetchReferrals() {
      if (!user) return;
      
      try {
        // Use Server-Side API to bypass RLS
        const res = await fetch(`/api/syndicate?userId=${user.id}`);
        const data = await res.json();

        if (res.ok && data.referrals) {
          setReferrals(data.referrals);
        }
      } catch (err) {
        console.error("Failed to fetch syndicate:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReferrals();
  }, [user]);

  const handleInvite = () => {
    const userId = user?.id || '777000'; 
    // Official Mini App Link
    const inviteLink = `https://t.me/ThePredictionMarket_bot/MoonPrediction?startapp=${userId}`;
    const message = `get early access to the CRICKET prediction market on ton 🏏 Get 1,000 points instantly.`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`;
    
    if (webApp && webApp.openTelegramLink) {
      webApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-6 pb-24 text-white">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-wider">My Syndicate</h1>
          <div className="ml-auto">
             <InfoTrigger title="Syndicate Mechanics" content="Your syndicate is your network of referrals. The larger your network, the higher your commission tier." />
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden bg-yellow-500 rounded-[32px] p-8 mb-8 shadow-2xl shadow-yellow-500/10">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2 opacity-80">
              <Users size={20} className="text-black" />
              <span className="text-black font-bold uppercase text-xs tracking-widest">Network Growth</span>
            </div>
            <h2 className="text-black font-black text-3xl mb-1">EARN 10%</h2>
            <p className="text-black/70 text-sm font-medium mb-8 max-w-[80%]">
              Commission on all future trading fees from your recruits.
            </p>
            
            <button 
              onClick={handleInvite}
              className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-xl"
            >
              <Share2 size={18} />
              <span>INVITE FRIENDS</span>
            </button>
          </div>
          
          {/* Abstract Pattern */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 border-[20px] border-white/20 rounded-full" />
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white/5 border border-white/10 p-5 rounded-[24px]">
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Recruits</p>
            <p className="text-3xl font-black text-white">{referrals.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-[24px]">
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Points Earned</p>
            <p className="text-3xl font-black text-yellow-500">{(referrals.length * 500).toLocaleString()}</p>
          </div>
        </div>

        {/* List */}
        <div>
          <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4 ml-2">Recent Activity</h3>
          <div className="space-y-2">
            {loading ? (
              <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />
            ) : referrals.length === 0 ? (
              <div className="bg-white/5 border border-white/5 border-dashed rounded-[24px] p-8 text-center">
                 <p className="text-zinc-500 text-sm">No recruits yet.</p>
              </div>
            ) : (
              referrals.map((ref, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i} 
                  className="bg-white/5 border border-white/5 rounded-[20px] p-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {ref.profiles?.first_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{ref.profiles?.first_name || 'Anonymous'}</p>
                      <p className="text-xs text-white/30">@{ref.profiles?.username || 'user'}</p>
                    </div>
                  </div>
                  <span className="text-yellow-500 font-bold text-xs bg-yellow-500/10 px-2 py-1 rounded-lg">+500</span>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}