'use client';

import { useTelegram } from "@/hooks/useTelegram";
import { supabase } from "@/lib/supabaseClient";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import InfoTrigger from "@/components/ui/InfoTrigger";

export default function WalletPage() {
  const { user } = useTelegram();
  const userFriendlyAddress = useTonAddress();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function saveWallet() {
      if (user && userFriendlyAddress) {
        try {
          const res = await fetch('/api/wallet/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: user.id,
              walletAddress: userFriendlyAddress 
            })
          });
          
          if (res.ok) setIsSaved(true);
        } catch (e) {
          console.error("Wallet Sync Error:", e);
        }
      }
    }

    if (userFriendlyAddress) {
      saveWallet();
    }
  }, [userFriendlyAddress, user]);

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col items-center flex-1">
        
        {/* Header */}
        <div className="flex w-full items-center gap-4 mb-16">
          <button 
            onClick={() => window.location.href = '/'}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-400" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider">Asset Verification</h1>
          <div className="ml-auto">
             <InfoTrigger title="TON Connection" content="Connecting your wallet proves you are a real user and allows us to distribute rewards directly to your on-chain address." />
          </div>
        </div>

        {/* Status Graphic */}
        <div className="relative mb-12 group">
          <div className={`absolute inset-0 blur-[60px] transition-colors duration-1000 ${userFriendlyAddress ? 'bg-green-500/20' : 'bg-white/5'}`} />
          
          <div className={`relative w-40 h-40 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
            userFriendlyAddress ? 'border-green-500 bg-[#0A0A0A]' : 'border-white/10 bg-[#0A0A0A]'
          }`}>
            {userFriendlyAddress ? (
               <CheckCircle size={64} className="text-green-500" />
            ) : (
              <div className="text-6xl text-white/10 font-black">?</div>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-black mb-3 text-center uppercase tracking-tight">
          {userFriendlyAddress ? "VERIFIED" : "CONNECT WALLET"}
        </h2>
        
        <p className="text-white/40 text-center text-sm mb-12 px-8 leading-relaxed font-medium">
          {userFriendlyAddress 
            ? "Your assets are secured. You are eligible for the Early Access airdrop." 
            : "Connect your TON wallet to store your Strategy Points and qualify for future rewards."}
        </p>

        {/* The Button */}
        <div className="mb-8 scale-110">
          <TonConnectButton />
        </div>

        {isSaved && (
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-[24px] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
             <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-500" />
             </div>
             <div>
                <p className="text-green-400 text-sm font-bold uppercase tracking-wide">Wallet Verified</p>
                <p className="text-white/60 text-[10px]">+1,000 Points Credited</p>
             </div>
          </div>
        )}

      </div>
    </main>
  );
}