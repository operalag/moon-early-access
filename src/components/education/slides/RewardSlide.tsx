'use client';

import { Trophy } from 'lucide-react';
import type { RewardSlide } from '@/lib/educationTypes';

interface RewardSlideComponentProps {
  slide: RewardSlide;
}

export default function RewardSlideComponent({ slide }: RewardSlideComponentProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-full text-center">
      {/* Trophy icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
        <Trophy size={40} className="text-black" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-2">
        {slide.title}
      </h2>

      {/* Body message */}
      <p className="text-white/70 mb-6 max-w-sm">
        {slide.body}
      </p>

      {/* Points display */}
      <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-4">
        +{slide.pointsAwarded}
      </div>
      <p className="text-white/50 text-sm mb-6">points earned</p>

      {/* Badge display */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
        <Trophy size={16} className="text-amber-400" />
        <span className="text-amber-400 font-medium">
          {slide.badgeName}
        </span>
      </div>
    </div>
  );
}

export { RewardSlideComponent };
