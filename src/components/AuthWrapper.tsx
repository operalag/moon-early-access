'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabaseClient';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, webApp } = useTelegram();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncUser() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Check if profile exists
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // 2. Profile doesn't exist -> CREATE NEW USER
          const { error: insertError } = await supabase.from('profiles').insert([
            {
              telegram_id: user.id,
              username: user.username,
              first_name: user.first_name,
              avatar_url: user.photo_url,
              total_points: 1000, // Base starting points
            },
          ]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        } else if (profile) {
          // 3. Update existing profile
          await supabase
            .from('profiles')
            .update({
              username: user.username,
              first_name: user.first_name,
              avatar_url: user.photo_url,
            })
            .eq('telegram_id', user.id);
        }

        // 4. Handle Referral (Check for both new and existing users)
        const startParam = webApp?.initDataUnsafe?.start_param;
        if (startParam && startParam !== String(user.id)) {
          await handleReferral(startParam, user.id);
        }

      } catch (err) {
        console.error('Auth sync error:', err);
      } finally {
        setLoading(false);
      }
    }

    syncUser();
  }, [user, webApp]);

  async function handleReferral(referrerId: string, refereeId: number) {
    try {
      // 1. Check if user has already been referred (Idempotency)
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referee_id', refereeId)
        .single();

      if (existingReferral) {
        return; 
      }

      // 2. Validate ID Format
      const referrerIdNum = Number(referrerId);
      if (isNaN(referrerIdNum)) {
         console.error("Invalid referrer ID");
         return;
      }

      // 3. BLIND INSERT (The Fix for v2.9)
      // We skip fetching the profile first to avoid RLS "Read" errors.
      // We trust the Foreign Key constraint to fail if the user doesn't exist.
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerIdNum,
          referee_id: refereeId,
        });

      if (insertError) {
        console.error("Referral Insert Error:", insertError);
        return;
      }

      // 4. Reward the Referrer (Best Effort)
      // Only now do we try to fetch profile to update points.
      // If this fails due to RLS, at least the Referral Record exists (Checkmark works).
      try {
        const { data: referrer } = await supabase
            .from('profiles')
            .select('telegram_id, total_points')
            .eq('telegram_id', referrerIdNum)
            .single();

        if (referrer) {
            await supabase
                .from('profiles')
                .update({ total_points: (referrer.total_points || 0) + 500 })
                .eq('telegram_id', referrerIdNum);
        }
      } catch (rewardErr) {
          console.warn("Could not reward points (RLS restriction likely):", rewardErr);
      }

    } catch (err: any) {
      console.error('Referral Critical Error:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-xl font-bold text-yellow-500 animate-pulse">LOADING MOON...</div>
      </div>
    );
  }

  return <>{children}</>;
}
