'use client';

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Slide } from '@/lib/educationTypes';
import SlideProgress from './SlideProgress';

// Animation constants from RESEARCH.md
const X_OFFSET = 300;
const SWIPE_THRESHOLD = 50; // pixels
const SWIPE_VELOCITY = 500; // pixels/second

// Direction-aware slide variants for smooth transitions
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? X_OFFSET : -X_OFFSET,
    opacity: 0,
  }),
  active: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1], // iOS-like easing
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -X_OFFSET : X_OFFSET,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};

interface SlideEngineProps {
  slides: Slide[];
  onSlideChange?: (index: number) => void;
  onComplete?: () => void;
}

export default function SlideEngine({ slides, onSlideChange, onComplete }: SlideEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentSlide = slides[currentIndex];
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;

  const goToSlide = (newIndex: number, newDirection: number) => {
    if (newIndex < 0 || newIndex >= slides.length) return;

    setDirection(newDirection);
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);
  };

  const goNext = () => {
    if (isLastSlide) {
      onComplete?.();
      return;
    }
    goToSlide(currentIndex + 1, 1);
  };

  const goPrev = () => {
    if (isFirstSlide) return;
    goToSlide(currentIndex - 1, -1);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;

    // Swipe left (next) - negative offset
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY) {
      if (!isLastSlide) {
        goToSlide(currentIndex + 1, 1);
      } else {
        onComplete?.();
      }
    }
    // Swipe right (prev) - positive offset
    else if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY) {
      if (!isFirstSlide) {
        goToSlide(currentIndex - 1, -1);
      }
    }
  };

  // Quiz answer handler - Phase 12-02 will add haptics/confetti here
  const handleQuizAnswer = (_isCorrect: boolean) => {
    // No-op for now - Phase 12-02 will implement haptic feedback and confetti
  };

  // Render the appropriate slide component based on type
  const renderSlide = (slide: Slide) => {
    switch (slide.type) {
      case 'intro':
        // Placeholder - Task 2 will create IntroSlideComponent
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-white/70">{slide.body}</p>
            {slide.mascotImage && (
              <img src={slide.mascotImage} alt="Mascot" className="mx-auto mt-4" />
            )}
          </div>
        );
      case 'concept':
        // Placeholder - Task 2 will create ConceptSlideComponent
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-white/70">{slide.body}</p>
            {slide.diagram && (
              <img src={slide.diagram} alt="Diagram" className="mx-auto mt-4 rounded-lg" />
            )}
          </div>
        );
      case 'quiz':
        // Placeholder - Task 2 will create QuizSlideComponent
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-white/70 mb-4">{slide.question}</p>
            <div className="space-y-2">
              {slide.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleQuizAnswer(option.id === slide.correctOptionId)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white text-left"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        );
      case 'action':
        // Placeholder - Task 2 will create ActionSlideComponent
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-white/70 mb-6">{slide.instruction}</p>
            <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl">
              {slide.buttonText}
            </button>
          </div>
        );
      case 'reward':
        // Placeholder - Task 2 will create RewardSlideComponent
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-white/70 mb-4">{slide.body}</p>
            <div className="text-3xl font-bold text-amber-500">+{slide.pointsAwarded} points</div>
            <div className="mt-2 inline-block px-4 py-1 bg-amber-500/20 text-amber-400 rounded-full">
              {slide.badgeName}
            </div>
          </div>
        );
      default:
        // TypeScript exhaustiveness check
        const _exhaustive: never = slide;
        return _exhaustive;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Slide content area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="active"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 touch-pan-y cursor-grab active:cursor-grabbing"
          >
            {renderSlide(currentSlide)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Previous button */}
        <button
          onClick={goPrev}
          disabled={isFirstSlide}
          className={`p-2 rounded-full transition-colors ${
            isFirstSlide
              ? 'text-white/20 cursor-not-allowed'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Progress dots */}
        <SlideProgress total={slides.length} current={currentIndex} />

        {/* Next button */}
        <button
          onClick={goNext}
          disabled={false}
          className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={isLastSlide ? 'Complete' : 'Next slide'}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
