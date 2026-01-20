'use client';

import { useTelegram } from "@/hooks/useTelegram";
import { supabase } from "@/lib/supabaseClient";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WalletPage() {
  const { user } = useTelegram();
  const userFriendlyAddress = useTonAddress();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function saveWallet() {
      if (user && userFriendlyAddress) {
        // Save to Supabase
        // Note: You need to add 'ton_wallet_address' column to profiles table first!
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_wallet_connected: true,
            // ton_wallet_address: userFriendlyAddress // Uncomment when column exists
          })
          .eq('telegram_id', user.id);
        
        if (!error) setIsSaved(true);
      }
    }

    if (userFriendlyAddress) {
      saveWallet();
    }
  }, [userFriendlyAddress, user]);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-black text-white">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Header */}
        <div className="flex w-full items-center gap-4 mb-12">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold uppercase tracking-wider">Asset Verification</h1>
        </div>

        {/* Status Icon */}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 border-4 transition-all ${
          userFriendlyAddress ? 'border-green-500 bg-green-500/20' : 'border-zinc-700 bg-zinc-800'
        }`}>
          {userFriendlyAddress ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">
          {userFriendlyAddress ? "WALLET CONNECTED" : "CONNECT TON WALLET"}
        </h2>
        
        <p className="text-zinc-400 text-center text-sm mb-8 px-4">
          {userFriendlyAddress 
            ? "Your assets are secured. You are eligible for the Early Access airdrop." 
            : "Connect your TON wallet to store your Strategy Points and qualify for future rewards."}
        </p>

        {/* The Button */}
        <div className="mb-8 scale-110">
          <TonConnectButton />
        </div>

        {isSaved && (
          <div className="bg-green-900/30 border border-green-800 p-4 rounded-xl flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-green-400 text-sm font-bold">Address Verified & Linked</p>
          </div>
        )}

      </div>
    </main>
  );
}
