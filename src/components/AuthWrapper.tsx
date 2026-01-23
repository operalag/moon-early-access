'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, webApp } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [referralStatus, setReferralStatus] = useState<string | null>(null);

  useEffect(() => {
    async function syncUser() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Sync Profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          await supabase.from('profiles').insert([{
              telegram_id: user.id,
              username: user.username,
              first_name: user.first_name,
              avatar_url: user.photo_url,
              total_points: 1000,
          }]);
        } else if (profile) {
          await supabase.from('profiles').update({
              username: user.username,
              first_name: user.first_name,
              avatar_url: user.photo_url,
          }).eq('telegram_id', user.id);
        }

        // 2. Handle Referral
        let startParam = webApp?.initDataUnsafe?.start_param;

        // FALLBACK: URL Scanner (for when SDK fails to populate start_param)
        if (!startParam && typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.slice(1));
          startParam = searchParams.get('tgWebAppStartParam') || 
                       hashParams.get('tgWebAppStartParam') ||
                       searchParams.get('startapp') ||
                       hashParams.get('startapp');
          
          if (startParam) console.log("MOON: Referral found in URL fallback:", startParam);
        }

        if (startParam && startParam !== String(user.id)) {
           setReferralStatus(`Detecting Invite: ${startParam}...`);
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
      setReferralStatus("Activating Invite...");
      
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrerId, refereeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Referral Error:", data.error);
        setReferralStatus(`Invite Failed: ${data.error}`);
      } else {
        setReferralStatus("Invite Accepted! +Rewards Applied");
        // Hide success message after 3s
        setTimeout(() => setReferralStatus(null), 3000);
      }

    } catch (err: any) {
      setReferralStatus("Connection Error");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="text-xl font-bold text-yellow-500 animate-pulse">LOADING MOON...</div>
      </div>
    );
  }

  return (
    <>
      {referralStatus && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4">
           {referralStatus.includes('Failed') ? null : <Loader2 size={16} className="animate-spin" />}
           <span className="text-xs font-bold">{referralStatus}</span>
        </div>
      )}
      {children}
    </>
  );
}
