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
      // Debugging: Alert to confirm function is called (Remove in final prod)
      // alert(`Processing Referral: Ref=${referrerId} User=${refereeId}`);

      // 1. Check if user has already been referred (Idempotency)
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referee_id', refereeId)
        .single();

      if (existingReferral) {
        // alert("Already referred. Skipping.");
        return; 
      }

      // 2. Validate Referrer Exists
      // precise type casting
      const referrerIdNum = Number(referrerId);
      if (isNaN(referrerIdNum)) {
         console.error("Invalid referrer ID");
         return;
      }

      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('telegram_id, total_points')
        .eq('telegram_id', referrerIdNum)
        .single();

      if (referrerError || !referrer) {
        // alert(`Referrer not found: ${referrerError?.message}`);
        console.error("Referrer fetch error:", referrerError);
        return;
      }

      // 3. Record the Referral
      // This enables the "Task Completion" checkmark for the Referrer
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.telegram_id,
          referee_id: refereeId,
        });

      if (insertError) {
        // alert(`Referral Insert Failed: ${insertError.message}`);
        console.error("Referral Insert Error:", insertError);
        return;
      }

      // alert("Referral Recorded Successfully!");

      // 4. Reward the Referrer
      // WARNING: This might fail if RLS prevents users from updating OTHERS' profiles.
      // Ideally, this should be a Database Trigger or RPC.
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_points: (referrer.total_points || 0) + 500 })
        .eq('telegram_id', referrer.telegram_id);

      if (updateError) {
        console.error("Point Update Failed (RLS likely):", updateError);
        // We do NOT alert here, because the main goal (Syndicate Building) is done.
        // The points might need to be reconciled via a backend script if this fails.
      } else {
        // alert("Referrer Rewarded +500pts");
      }

    } catch (err: any) {
      console.error('Referral Critical Error:', err);
      // alert(`Critical Error: ${err.message}`);
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
