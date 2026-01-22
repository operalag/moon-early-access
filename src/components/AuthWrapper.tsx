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
      // Server-Side Bypass: 
      // We delegate the database operations to the Next.js API route 
      // which uses the Admin Key to bypass RLS policies.
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            referrerId, 
            refereeId 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Referral API Failed:", data.error);
      } else {
        console.log("Referral Processed:", data.message || "Success");
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
