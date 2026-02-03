'use client';

import type { ConceptSlide } from '@/lib/educationTypes';

interface ConceptSlideComponentProps {
  slide: ConceptSlide;
}

export default function ConceptSlideComponent({ slide }: ConceptSlideComponentProps) {
  return (
    <div className="p-6 flex flex-col min-h-full">
      {/* Title at top */}
      <h2 className="text-xl font-bold text-white mb-4">
        {slide.title}
      </h2>

      {/* Body text - can be longer for educational content */}
      <p className="text-white/70 leading-relaxed flex-1">
        {slide.body}
      </p>

      {/* Optional diagram */}
      {slide.diagram && (
        <div className="mt-6">
          <img
            src={slide.diagram}
            alt="Concept diagram"
            className="w-full rounded-xl border border-white/10"
          />
        </div>
      )}
    </div>
  );
}

export { ConceptSlideComponent };
