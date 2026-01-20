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
          } else {
            // 3. Handle Referral (only for new users)
            const startParam = webApp?.initDataUnsafe?.start_param;
            
            if (startParam && startParam !== String(user.id)) {
              await handleReferral(startParam, user.id);
            }
          }
        } else if (profile) {
          // 4. Update existing profile
          await supabase
            .from('profiles')
            .update({
              username: user.username,
              first_name: user.first_name,
              avatar_url: user.photo_url,
            })
            .eq('telegram_id', user.id);
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
      // Validate referrer exists
      const { data: referrer } = await supabase
        .from('profiles')
        .select('telegram_id, total_points')
        .eq('telegram_id', referrerId)
        .single();

      if (referrer) {
        // Record the referral
        const { error: refError } = await supabase
          .from('referrals')
          .insert({
            referrer_id: referrer.telegram_id,
            referee_id: refereeId,
          });

        if (!refError) {
          // Reward the Referrer (e.g., +500 points)
          await supabase
            .from('profiles')
            .update({ total_points: (referrer.total_points || 0) + 500 })
            .eq('telegram_id', referrer.telegram_id);
            
          // Optional: Reward the Referee (e.g., +200 bonus)
          // We'd need to fetch the referee's current points first or update via RPC function
        }
      }
    } catch (err) {
      console.error('Referral error:', err);
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
