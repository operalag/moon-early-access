'use client';

import { useEffect, useRef } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import type { ActionSlide } from '@/lib/educationTypes';

interface ActionSlideComponentProps {
  slide: ActionSlide;
  onActionComplete?: () => void;
}

export default function ActionSlideComponent({ slide, onActionComplete }: ActionSlideComponentProps) {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const isConnected = !!userFriendlyAddress;
  const hasTriggeredComplete = useRef(false);

  // Auto-advance when wallet connects (for wallet_connect action type)
  useEffect(() => {
    if (slide.actionType === 'wallet_connect' && isConnected && !hasTriggeredComplete.current) {
      hasTriggeredComplete.current = true;
      onActionComplete?.();
    }
  }, [isConnected, slide.actionType, onActionComplete]);

  const handleActionClick = () => {
    if (slide.actionType === 'wallet_connect') {
      if (!isConnected) {
        // Open TonConnect modal
        tonConnectUI.openModal();
      } else {
        // Already connected, proceed
        onActionComplete?.();
      }
    } else {
      // Other action types - call the callback directly
      onActionComplete?.();
    }
  };

  // Determine button text based on connection state
  const buttonText = slide.actionType === 'wallet_connect' && isConnected
    ? 'Continue'
    : slide.buttonText;

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
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export { ActionSlideComponent };
