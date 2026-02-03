'use client';

import { useTelegram } from "@/hooks/useTelegram";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, Bell, BellOff, Shield, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import WeeklyRewardBanner from "@/components/WeeklyRewardBanner";

export default function SettingsPage() {
  const { user } = useTelegram();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('is_push_enabled')
        .eq('telegram_id', user.id)
        .single();
      
      if (data) setPushEnabled(data.is_push_enabled ?? true);
      setLoading(false);
    }
    fetchSettings();
  }, [user]);

  const togglePush = async () => {
    const newValue = !pushEnabled;
    setPushEnabled(newValue);
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ is_push_enabled: newValue })
        .eq('telegram_id', user.id);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-6 pb-32 text-white">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12 pt-4">
          <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">Settings</h1>
        </div>

        {/* Section: Notifications */}
        <section className="mb-8">
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 ml-2">Notifications</h2>
          <div className="bg-white/5 border border-white/10 rounded-[24px] overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${pushEnabled ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5 text-zinc-500'}`}>
                  {pushEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                </div>
                <div>
                  <p className="font-bold text-sm">Push Notifications</p>
                  <p className="text-[10px] text-white/40">Daily nudges & market alerts</p>
                </div>
              </div>
              
              <button 
                onClick={togglePush}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${pushEnabled ? 'bg-yellow-500' : 'bg-zinc-700'}`}
              >
                <motion.div 
                  animate={{ x: pushEnabled ? 26 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </div>
        </section>

        {/* Section: Account & Device */}
        <section className="mb-8">
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 ml-2">App Info</h2>
          <div className="bg-white/5 border border-white/10 rounded-[24px] overflow-hidden divide-y divide-white/5">
            <div className="p-5 flex items-center gap-4">
               <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Smartphone size={20} />
               </div>
               <div>
                  <p className="font-bold text-sm uppercase">Version</p>
                  <p className="text-[10px] text-white/40">Build 5.9.0-beta</p>
               </div>
            </div>
            <div className="p-5 flex items-center gap-4">
               <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl">
                  <Shield size={20} />
               </div>
               <div>
                  <p className="font-bold text-sm uppercase">Security</p>
                  <p className="text-[10px] text-white/40">Biometric support pending</p>
               </div>
            </div>
          </div>
        </section>

        {/* Section: Weekly Rewards */}
        <section className="mb-8">
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 ml-2">Weekly Rewards</h2>
          <WeeklyRewardBanner />
        </section>

        <div className="text-center mt-12">
           <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Powered by MOON Protocol</p>
        </div>

      </div>
    </main>
  );
}
