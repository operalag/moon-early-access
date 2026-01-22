'use client';

import { useDailyLogin } from '@/hooks/useDailyLogin';
import { Flame } from 'lucide-react';
import InfoTrigger from './ui/InfoTrigger';

export default function DailyLoginCard() {
  const { loading, hasClaimedToday, streak, claimDailyReward, showModal, setShowModal } = useDailyLogin();

  if (loading) return <div className="animate-pulse bg-white/5 h-24 rounded-[32px] border border-white/5"></div>;

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-[32px] p-1 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm z-0" />
        
        <div className="relative z-10 bg-[#0A0A0A]/80 rounded-[28px] p-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                <Flame size={24} fill="white" />
             </div>
             <div>
                <div className="flex items-center gap-1">
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Streak</p>
                  <InfoTrigger title="Daily Streak" content="Log in every consecutive day to increase your streak multiplier. Missing a day resets it to zero." />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{streak}</span>
                  <span className="text-xs font-medium text-orange-400">days</span>
                </div>
             </div>
          </div>

          {hasClaimedToday ? (
            <button disabled className="bg-white/5 text-white/30 px-5 py-2.5 rounded-xl font-bold text-xs border border-white/5">
              CLAIMED
            </button>
          ) : (
            <button 
              onClick={claimDailyReward}
              className="bg-white text-black px-6 py-3 rounded-xl font-bold text-xs hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              CLAIM REWARD
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="bg-[#121212] border border-orange-500/50 rounded-[40px] p-8 max-w-sm w-full text-center relative shadow-2xl shadow-orange-500/20">
            <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
              <Flame size={40} fill="black" className="text-black" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase italic">Streak Extended!</h2>
            <p className="text-zinc-400 text-sm mb-8">
              You kept the fire alive. <br/>
              <span className="text-orange-400 font-bold">+{100 + (streak * 10)} pts</span> added to your balance.
            </p>
            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-colors"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </>
  );
}