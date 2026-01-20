'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTelegram } from './useTelegram';

export function useDailyLogin() {
  const { user } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    checkLoginStatus();
  }, [user]);

  async function checkLoginStatus() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Check if we already have a record for today
      const { data: todayLog } = await supabase
        .from('daily_logins')
        .select('*')
        .eq('user_id', user.id)
        .eq('login_date', today)
        .single();

      if (todayLog) {
        setHasClaimedToday(true);
        setStreak(todayLog.streak_count);
        setLoading(false);
        return;
      }

      // 2. If not claimed today, check yesterday for streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data: yesterdayLog } = await supabase
        .from('daily_logins')
        .select('streak_count')
        .eq('user_id', user.id)
        .eq('login_date', yesterdayStr)
        .single();

      const currentStreak = yesterdayLog ? yesterdayLog.streak_count : 0;
      
      // We don't auto-claim. We want the user to click a button.
      setStreak(currentStreak);
      setHasClaimedToday(false);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function claimDailyReward() {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newStreak = streak + 1;
    const reward = 100 + (newStreak * 10); // Base 100 + 10 per streak day

    // 1. Insert Login Record
    const { error } = await supabase.from('daily_logins').insert({
      user_id: user.id,
      login_date: today,
      streak_count: newStreak
    });

    if (!error) {
      // 2. Update User Points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('telegram_id', user.id)
        .single();
        
      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_points: profile.total_points + reward })
          .eq('telegram_id', user.id);
      }

      setHasClaimedToday(true);
      setStreak(newStreak);
      setShowModal(true); // Show success modal
    }
  }

  return { loading, hasClaimedToday, streak, claimDailyReward, showModal, setShowModal };
}
