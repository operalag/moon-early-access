'use client';

import AuthWrapper from "@/components/AuthWrapper";
import { useTelegram } from "@/hooks/useTelegram";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import DailyLoginCard from "@/components/DailyLoginCard";
import InfoTrigger from "@/components/ui/InfoTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Users, Wallet, TrendingUp } from "lucide-react";
import ProgressionCard from "@/components/ProgressionCard";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useTonAddress } from "@tonconnect/ui-react";

function Dashboard() {
  const { user } = useTelegram();
  const userFriendlyAddress = useTonAddress();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check session storage on mount
  useEffect(() => {
    const sessionStarted = sessionStorage.getItem('moon_has_started');
    if (sessionStarted === 'true') {
      setHasStarted(true);
    }
    setIsChecking(false);
  }, []);

  const handleStart = () => {
    sessionStorage.setItem('moon_has_started', 'true');
    setHasStarted(true);
  };

  const [stats, setStats] = useState({
    points: 1000,
    isWalletConnected: false,
    referralCount: 0,
    streak: 0,
    rank: 0,
    hasJoinedChannel: false
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, is_wallet_connected, has_joined_channel')
        .eq('telegram_id', user.id)
        .single();
      
      const currentPoints = profile?.total_points || 1000;

      const { count: refCount } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id);

      const { data: loginData } = await supabase
        .from('daily_logins')
        .select('streak_count')
        .eq('user_id', user.id)
        .order('login_date', { ascending: false })
        .limit(1)
        .single();

      const { count: usersAbove, error: rankError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', currentPoints);
      
      const rank = (usersAbove !== null ? usersAbove : 0) + 1;

      setStats({
        points: currentPoints,
        isWalletConnected: profile?.is_wallet_connected || !!userFriendlyAddress,
        referralCount: refCount || 0,
        streak: loginData?.streak_count || 0,
        rank: rank,
        hasJoinedChannel: profile?.has_joined_channel || false
      });
    }

    fetchData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchData);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchData);
    };
  }, [user, userFriendlyAddress]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (isChecking) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <>
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50"
          >
            <WelcomeScreen onStart={handleStart} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-[#050505] to-[#050505] p-6 pb-24">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-md mx-auto space-y-6"
        >
                  {/* Header Section */}
                  <motion.div variants={item} className="space-y-4 pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white leading-none">
                          MOON<span className="text-yellow-500">.</span>
                        </h1>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-2">Prediction Market</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Early Access</span>
                      </div>
                    </div>
                  </motion.div>
                    {/* User Stats Card */}
          <motion.div variants={item} className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-[50px]" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black text-2xl font-black shadow-lg shadow-yellow-500/20">
                {user?.first_name?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="flex items-center">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Analyst Profile</p>
                  <InfoTrigger title="Analyst Profile" content="This is your unique identity on the MOON protocol. Your reputation is built here." />
                </div>
                <h2 className="text-xl font-bold text-white">{user?.first_name || 'Guest'}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <Zap size={16} className="text-yellow-500" />
                  <InfoTrigger title="Strategy Points" content="Points are used to enter prediction markets. Earn them by inviting friends, daily logins, or winning predictions." />
                </div>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Strategy Points</p>
                <p className="text-2xl font-black text-white">{stats.points.toLocaleString()}</p>
              </div>
                          <Link href="/leaderboard" className="bg-black/40 p-4 rounded-2xl border border-white/5 block hover:bg-black/60 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <Trophy size={16} className="text-purple-500" />
                              <InfoTrigger title="Global Rank" content="Your ranking compared to all other analysts. Top 100 users will receive exclusive airdrops at launch." />
                            </div>
                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Global Rank</p>
                            <p className="text-2xl font-black text-white">#{stats.rank > 0 ? stats.rank.toLocaleString() : '--'}</p>
                          </Link>
              
            </div>
          </motion.div>
          
          <motion.div variants={item}>
            <ProgressionCard />
          </motion.div>
          
          <motion.div variants={item}>
             <DailyLoginCard />
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <Link href="/syndicate" className="block group">
              <div className="relative overflow-hidden bg-yellow-500 rounded-[24px] p-5 transition-transform active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/10 rounded-xl">
                      <Users className="text-black" size={24} />
                    </div>
                    <div>
                      <h3 className="text-black font-black text-lg leading-tight">BUILD SYNDICATE</h3>
                      <p className="text-black/60 text-xs font-medium">Earn 500 pts per recruit</p>
                    </div>
                  </div>
                  <div className="bg-black/10 p-2 rounded-full">
                    <InfoTrigger className="!text-black/50 hover:!text-black" title="Syndicate" content="Invite friends to trade against. You earn a 10% commission on their trading fees forever." />
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/spin" className="block group">
                <div className="h-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-[24px] p-5 transition-colors active:scale-95 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <TrendingUp className="text-blue-400" size={24} />
                    <InfoTrigger title="Daily Spin" content="Test market volatility. Spin once every 24 hours to win free points." />
                  </div>
                  <div>
                     <h3 className="text-white font-bold text-sm">DAILY SPIN</h3>
                     <p className="text-white/40 text-[10px]">Win up to 1000 pts</p>
                  </div>
                </div>
              </Link>

              <Link href="/wallet" className="block group">
                <div className="h-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-[24px] p-5 transition-colors active:scale-95 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <Wallet className="text-green-400" size={24} />
                    <InfoTrigger title="Asset Verification" content="Connect your TON wallet to convert your points into real tokens when the mainnet launches." />
                  </div>
                  <div>
                     <h3 className="text-white font-bold text-sm">VERIFY ASSETS</h3>
                     <p className="text-white/40 text-[10px]">Secure your allocation</p>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>

          <motion.div variants={item} className="pt-4">
             <div className="flex items-center gap-2 mb-3 px-1">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
               <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Featured Market</h3>
               <InfoTrigger title="Featured Market" content="These are the highest volume markets currently open for analysis. Early positions often yield better returns." />
             </div>
             
             <div className="bg-white/5 border border-white/10 rounded-[24px] p-1">
                <div className="bg-[#0A0A0A] rounded-[20px] p-4 border border-white/5">
                  <div className="flex justify-between items-start mb-3">
                     <div className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                       Cricket World Cup
                     </div>
                     <span className="text-white/30 text-[10px] font-mono">ID: #8821</span>
                  </div>
                  <h4 className="text-white font-bold text-lg mb-1">India vs Pakistan</h4>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden flex mt-3">
                     <div className="h-full bg-green-500 w-[65%]" />
                     <div className="h-full bg-red-500 w-[35%]" />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-mono font-medium">
                    <span className="text-green-400">IND 65%</span>
                    <span className="text-red-400">PAK 35%</span>
                  </div>
                </div>
             </div>
          </motion.div>

                  <motion.div variants={item} className="text-center pt-8 pb-4 opacity-30">
                    <p className="text-[10px] font-mono uppercase tracking-widest">System v5.2.0-alpha • Build 2026-01-24-MegaphoneEngine</p>
                  </motion.div>
                  </motion.div>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  );
}
