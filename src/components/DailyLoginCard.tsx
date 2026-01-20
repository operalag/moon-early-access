'use client';

import { useDailyLogin } from '@/hooks/useDailyLogin';

export default function DailyLoginCard() {
  const { loading, hasClaimedToday, streak, claimDailyReward, showModal, setShowModal } = useDailyLogin();

  if (loading) return <div className="animate-pulse bg-zinc-900 h-24 rounded-2xl"></div>;

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center mb-4">
        <div>
          <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Daily Streak</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">{streak}</span>
            <span className="text-2xl">🔥</span>
          </div>
        </div>

        {hasClaimedToday ? (
          <button disabled className="bg-zinc-800 text-zinc-500 px-6 py-2 rounded-xl font-bold text-sm">
            CLAIMED
          </button>
        ) : (
          <button 
            onClick={claimDailyReward}
            className="bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-xl font-bold text-sm animate-pulse"
          >
            CLAIM REWARD
          </button>
        )}
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-8 max-w-sm w-full text-center relative">
            <h2 className="text-3xl font-black text-yellow-500 mb-2">STREAK EXTENDED!</h2>
            <p className="text-white text-lg mb-6">You earned <span className="font-bold text-green-400">+{100 + (streak * 10)} pts</span></p>
            <div className="text-6xl mb-6">🔥</div>
            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-white text-black font-bold py-3 rounded-xl"
            >
              CONTINUE TRADING
            </button>
          </div>
        </div>
      )}
    </>
  );
}
