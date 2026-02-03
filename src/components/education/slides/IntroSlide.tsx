'use client';

import type { IntroSlide } from '@/lib/educationTypes';

interface IntroSlideComponentProps {
  slide: IntroSlide;
}

export default function IntroSlideComponent({ slide }: IntroSlideComponentProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-full">
      {/* Large title at top */}
      <h1 className="text-2xl font-bold text-white mb-4 text-center">
        {slide.title}
      </h1>

      {/* Body text centered */}
      <p className="text-white/70 text-center leading-relaxed max-w-sm">
        {slide.body}
      </p>

      {/* Optional mascot image */}
      {slide.mascotImage && (
        <div className="mt-8">
          <img
            src={slide.mascotImage}
            alt="Cricket mascot"
            className="w-32 h-32 object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
}

export { IntroSlideComponent };
