'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { QuizSlide } from '@/lib/educationTypes';

interface QuizSlideComponentProps {
  slide: QuizSlide;
  onAnswer?: (isCorrect: boolean) => void;
}

export default function QuizSlideComponent({ slide, onAnswer }: QuizSlideComponentProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (showResult) return; // Already answered

    const isCorrect = optionId === slide.correctOptionId;
    setSelectedOptionId(optionId);
    setShowResult(true);
    onAnswer?.(isCorrect);
  };

  const getOptionStyles = (optionId: string) => {
    if (!showResult) {
      // Before selection - default state
      return 'bg-white/10 border-white/20 hover:bg-white/15';
    }

    if (optionId === slide.correctOptionId) {
      // Correct option - always show green after result
      return 'bg-green-500/20 border-green-500';
    }

    if (optionId === selectedOptionId) {
      // Selected but incorrect
      return 'bg-red-500/20 border-red-500';
    }

    // Other options after result - dimmed
    return 'bg-white/5 border-white/10 opacity-50';
  };

  const renderOptionIcon = (optionId: string) => {
    if (!showResult) return null;

    if (optionId === slide.correctOptionId) {
      return <Check size={16} className="text-green-500" />;
    }

    if (optionId === selectedOptionId && optionId !== slide.correctOptionId) {
      return <X size={16} className="text-red-500" />;
    }

    return null;
  };

  return (
    <div className="p-6 flex flex-col min-h-full">
      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-4">
        {slide.title}
      </h2>

      {/* Question */}
      <p className="text-white/80 mb-6">
        {slide.question}
      </p>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {slide.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelectOption(option.id)}
            disabled={showResult}
            className={`w-full p-4 border rounded-xl text-white text-left transition-all duration-200 flex items-center justify-between ${getOptionStyles(option.id)}`}
          >
            <span>{option.text}</span>
            {renderOptionIcon(option.id)}
          </button>
        ))}
      </div>

      {/* Explanation - shown after answering */}
      {showResult && (
        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/70 text-sm">
            {slide.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export { QuizSlideComponent };
