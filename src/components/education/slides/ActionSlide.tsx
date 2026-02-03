'use client';

import type { ActionSlide } from '@/lib/educationTypes';

interface ActionSlideComponentProps {
  slide: ActionSlide;
  onAction?: () => void;
}

export default function ActionSlideComponent({ slide, onAction }: ActionSlideComponentProps) {
  const handleActionClick = () => {
    // Call the onAction callback - Phase 13 will implement actual wallet connect logic
    onAction?.();
  };

  return (
    <div className="p-6 flex flex-col min-h-full">
      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-4">
        {slide.title}
      </h2>

      {/* Instruction text */}
      <p className="text-white/70 leading-relaxed flex-1">
        {slide.instruction}
      </p>

      {/* CTA Button */}
      <div className="mt-6">
        <button
          onClick={handleActionClick}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl transition-transform active:scale-[0.98] shadow-lg shadow-amber-500/20"
        >
          {slide.buttonText}
        </button>
      </div>
    </div>
  );
}

export { ActionSlideComponent };
