'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from './useTelegram';
import { supabase } from '@/lib/supabaseClient';
import { useTonAddress } from '@tonconnect/ui-react';

export type TaskStatus = {
  isWalletConnected: boolean;
  walletAddress: string | null;
  referralCount: number;
  hasReferrals: boolean;
  streak: number;
  hasJoinedChannel: boolean;
  totalProgress: number;
};

export function useProgression() {
  const { user } = useTelegram();
  const sdkAddress = useTonAddress();
  
  const [status, setStatus] = useState<TaskStatus>({
    isWalletConnected: false,
    walletAddress: null,
    referralCount: 0,
    hasReferrals: false,
    streak: 0,
    hasJoinedChannel: false,
    totalProgress: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchProgression = useCallback(async () => {
    if (!user) return;

    try {
      // 1. Fetch Profile & Logs
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_wallet_connected, has_joined_channel')
        .eq('telegram_id', user.id)
        .single();

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

      // 2. Determine Status
      const dbWalletConnected = profile?.is_wallet_connected || false;
      // We prioritize the SDK address if available, otherwise DB boolean
      const isWalletConnected = !!sdkAddress || dbWalletConnected;
      
      const streak = loginData?.streak_count || 0;
      const referralCount = refCount || 0;
      const hasJoinedChannel = profile?.has_joined_channel || false;

      // 3. Calculate Progress
      // Weights: Wallet(25), Referrals(25), Channel(25), Streak(25)
      let progress = 0;
      if (isWalletConnected) progress += 25;
      if (referralCount > 0) progress += 25;
      if (hasJoinedChannel) progress += 25;
      if (streak > 0) progress += 25;

      setStatus({
        isWalletConnected,
        walletAddress: sdkAddress || (dbWalletConnected ? 'Connected' : null),
        referralCount,
        hasReferrals: referralCount > 0,
        streak,
        hasJoinedChannel,
        totalProgress: progress
      });

    } catch (err) {
      console.error("Progression Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, sdkAddress]);

  // Initial Fetch & Polling
  useEffect(() => {
    fetchProgression();
    
    // Poll every 5s to catch updates
    const interval = setInterval(fetchProgression, 5000);
    
    // Also listen for visibility changes (tab switch)
    const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') fetchProgression();
    };
    window.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
        clearInterval(interval);
        window.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchProgression]);

  return { status, loading, refresh: fetchProgression };
}
