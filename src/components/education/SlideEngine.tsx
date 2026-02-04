'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Slide } from '@/lib/educationTypes';
import SlideProgress from './SlideProgress';
import IntroSlideComponent from './slides/IntroSlide';
import ConceptSlideComponent from './slides/ConceptSlide';
import QuizSlideComponent from './slides/QuizSlide';
import ActionSlideComponent from './slides/ActionSlide';
import RewardSlideComponent from './slides/RewardSlide';

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

export interface UnlockContext {
  nextModuleId?: string;
  nextModuleTitle?: string;
  nextModuleIcon?: string;
}

interface SlideEngineProps {
  slides: Slide[];
  initialSlideIndex?: number;
  onSlideChange?: (index: number) => void;
  onComplete?: () => void;
  unlockContext?: UnlockContext;
  onGoToNextModule?: () => void;
}

export default function SlideEngine({ slides, initialSlideIndex, onSlideChange, onComplete, unlockContext, onGoToNextModule }: SlideEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex ?? 0);
  const [direction, setDirection] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Hide swipe hint after first navigation or after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const currentSlide = slides[currentIndex];
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;

  const goToSlide = (newIndex: number, newDirection: number) => {
    if (newIndex < 0 || newIndex >= slides.length) return;

    setDirection(newDirection);
    setCurrentIndex(newIndex);
    setShowSwipeHint(false); // Hide hint on first navigation
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

  // Fire confetti burst for correct quiz answers
  const fireConfetti = () => {
    const colors = ['#22c55e', '#16a34a', '#15803d']; // Green theme for correct answer
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.5, y: 0.6 },
      colors,
      startVelocity: 30,
      gravity: 1.2,
    });
  };

  // Quiz answer handler - triggers confetti for correct answers
  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      fireConfetti(); // Celebrate correct answer with confetti
    }
    // Haptic feedback is handled in QuizSlide component
  };

  // Action slide completion handler - advances to next slide
  const handleActionComplete = () => {
    goNext();
  };

  // Render the appropriate slide component based on type (discriminated union switch)
  const renderSlide = (slide: Slide) => {
    switch (slide.type) {
      case 'intro':
        return <IntroSlideComponent slide={slide} />;
      case 'concept':
        return <ConceptSlideComponent slide={slide} />;
      case 'quiz':
        return <QuizSlideComponent slide={slide} onAnswer={handleQuizAnswer} />;
      case 'action':
        return <ActionSlideComponent slide={slide} onActionComplete={handleActionComplete} />;
      case 'reward':
        return <RewardSlideComponent slide={slide} unlockContext={unlockContext} onContinue={onComplete} onGoToNextModule={onGoToNextModule} />;
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

      {/* Swipe hint - shows on first slide */}
      <AnimatePresence>
        {showSwipeHint && currentIndex === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-3 mx-6 mb-2 bg-white/10 rounded-xl"
          >
            <motion.div
              animate={{ x: [-8, 8, -8] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="text-amber-400"
            >
              <MoveHorizontal size={20} />
            </motion.div>
            <span className="text-sm font-medium text-white/80">Swipe or tap arrows to navigate</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation controls - positioned above bottom menu */}
      <div className="flex items-center justify-between px-4 py-4 mb-24">
        {/* Previous button */}
        <button
          onClick={goPrev}
          disabled={isFirstSlide}
          className={`p-3 rounded-full transition-all ${
            isFirstSlide
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
          }`}
          aria-label="Previous slide"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Progress dots */}
        <SlideProgress total={slides.length} current={currentIndex} />

        {/* Next button */}
        <button
          onClick={goNext}
          className="p-3 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 active:scale-95 transition-all"
          aria-label={isLastSlide ? 'Complete' : 'Next slide'}
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
