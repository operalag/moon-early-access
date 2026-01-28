'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, Zap } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';

interface WalletGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletGateModal({ isOpen, onClose }: WalletGateModalProps) {
  const [tonConnectUI] = useTonConnectUI();

  const handleConnectWallet = () => {
    // Close modal FIRST to avoid z-index conflicts with TonConnect modal
    onClose();
    // Then open TonConnect modal
    tonConnectUI.openModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#121212] border-t border-white/10 p-6 rounded-t-3xl shadow-2xl"
          >
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              {/* Wallet Icon */}
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <Wallet size={32} className="text-yellow-500" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2">Wallet Required</h3>

              {/* Body */}
              <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-xs">
                Connect your TON wallet to access prediction markets. You&apos;ll need TON for gas and USDT for trading.
              </p>

              {/* Points Reward Callout */}
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
                <Zap size={16} className="text-yellow-500" />
                <span className="text-yellow-500 font-bold text-sm">+1,000 Points</span>
              </div>

              {/* Primary CTA */}
              <button
                onClick={handleConnectWallet}
                className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl active:scale-95 transition-transform mb-3"
              >
                Connect Wallet
              </button>

              {/* Secondary */}
              <button
                onClick={onClose}
                className="w-full bg-white/5 text-white/60 font-medium py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
