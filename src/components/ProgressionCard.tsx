'use client';

import { motion } from 'framer-motion';
import { Check, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import InfoTrigger from './ui/InfoTrigger';
import Link from 'next/link';
import { useProgression } from '@/hooks/useProgression';
import { useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabaseClient';

export default function ProgressionCard() {
  const { status, loading, refresh } = useProgression();
  const { user, webApp } = useTelegram();
  const [verifyingChannel, setVerifyingChannel] = useState(false);

  const handleVerifyChannel = async () => {
    if (!user) return;
    setVerifyingChannel(true);
    try {
      const res = await fetch('/api/verify-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await res.json();
      
      if (data.joined) {
        alert("Verification Successful! +500 Points");
        
        const { error } = await supabase
          .from('profiles')
          .update({ has_joined_channel: true })
          .eq('telegram_id', user.id);
        
        if (error) {
             console.error("DB Update Error:", error);
             alert(`DB Error: ${error.message}`);
        }

        refresh(); // Immediate refresh
      } else {
        alert(`Status: ${data.status || 'Not Joined'}. Opening channel...`);
        if (webApp) webApp.openTelegramLink('https://t.me/cricketandcrypto');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Verification failed: ${err.message || 'Unknown error'}`);
    } finally {
      setVerifyingChannel(false);
    }
  };

  const steps = [
    { 
      id: 1, 
      label: status.isWalletConnected && status.walletAddress
        ? `${status.walletAddress.slice(0, 4)}...${status.walletAddress.slice(-4)}` 
        : status.isWalletConnected 
          ? "Wallet Linked" 
          : "Connect Wallet", 
      done: status.isWalletConnected, 
      weight: 25,
      href: "/wallet"
    },
    { 
      id: 2, 
      label: "Build Syndicate", 
      done: status.hasReferrals, 
      weight: 25,
      href: "/syndicate"
    },
    { 
      id: 3, 
      label: "Join Community", 
      done: status.hasJoinedChannel, 
      weight: 25,
      action: handleVerifyChannel
    },
    { 
      id: 4, 
      label: "Daily Streak", 
      done: status.streak > 0, 
      weight: 25,
      href: "/spin"
    }
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 mb-6 relative overflow-hidden">
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Task Completion</h3>
            <div className="flex gap-2">
                <InfoTrigger title="Mainnet Readiness" content="Complete these core tasks to maximize your eligibility." />
                <button onClick={refresh} className="p-1 text-white/20 hover:text-white transition-colors">
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
          </div>
          <p className="text-white/40 text-[10px] font-medium">Your journey to professional analysis</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            {status.totalProgress}%
          </span>
        </div>
      </div>

      <div className="h-3 w-full bg-black/40 rounded-full mb-6 overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${status.totalProgress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"
        />
      </div>

      <div className="space-y-2">
        {steps.map((step) => {
          const content = (
            <>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  step.done 
                    ? 'bg-green-500 border-green-500 text-black' 
                    : 'bg-white/5 border-white/10 text-white/20'
                }`}>
                  {step.done ? <Check size={12} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                </div>
                <span className={`text-xs font-medium transition-colors duration-300 ${step.done ? 'text-zinc-500' : 'text-white'}`}>
                  {step.label}
                </span>
              </div>
              
              {!step.done && (
                 <div className="flex items-center gap-1">
                   {step.id === 3 && verifyingChannel ? (
                     <Loader2 size={12} className="animate-spin text-yellow-500" />
                   ) : (
                     <ChevronRight size={12} className="text-white/20" />
                   )}
                 </div>
              )}
            </>
          );

          if (step.action) {
            return (
              <button 
                key={step.id}
                onClick={step.action}
                disabled={step.done || verifyingChannel}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                  step.done ? 'bg-transparent cursor-default' : 'hover:bg-white/5'
                }`}
              >
                {content}
              </button>
            )
          }

          return (
            <Link 
              key={step.id} 
              href={step.href!}
              className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                step.done ? 'bg-transparent' : 'hover:bg-white/5'
              }`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
