'use client';

import { Trophy, Unlock, TrendingUp, ChevronRight } from 'lucide-react';
import type { RewardSlide } from '@/lib/educationTypes';
import type { UnlockContext } from '../SlideEngine';

interface RewardSlideComponentProps {
  slide: RewardSlide;
  unlockContext?: UnlockContext;
}

export default function RewardSlideComponent({ slide, unlockContext }: RewardSlideComponentProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-full text-center">
      {/* Trophy icon */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
        <Trophy size={32} className="text-black" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-2">
        {slide.title}
      </h2>

      {/* Body message */}
      <p className="text-white/70 mb-4 max-w-sm text-sm">
        {slide.body}
      </p>

      {/* Points and Badge row */}
      <div className="flex items-center gap-4 mb-6">
        {/* Points display */}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            +{slide.pointsAwarded}
          </div>
          <p className="text-white/40 text-xs">points</p>
        </div>

        <div className="w-px h-10 bg-white/10" />

        {/* Badge display */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-amber-400 font-medium text-sm">
              {slide.badgeName}
            </span>
          </div>
          <p className="text-white/40 text-xs mt-1">badge earned</p>
        </div>
      </div>

      {/* What's Next Section */}
      <div className="w-full max-w-xs space-y-2">
        {/* Leaderboard update */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
          <TrendingUp size={18} className="text-green-400" />
          <span className="text-white/70 text-sm">Leaderboard updated</span>
        </div>

        {/* Unlocked module */}
        {unlockContext?.nextModuleTitle && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
            <Unlock size={18} className="text-amber-400" />
            <span className="text-white/70 text-sm flex-1">
              Unlocked: <span className="text-white font-medium">{unlockContext.nextModuleTitle}</span>
            </span>
            <span className="text-lg">{unlockContext.nextModuleIcon}</span>
          </div>
        )}

        {/* Continue hint */}
        <p className="text-white/30 text-xs pt-2 flex items-center justify-center gap-1">
          Swipe or tap <ChevronRight size={14} /> to continue
        </p>
      </div>
    </div>
  );
}

export { RewardSlideComponent };
