'use client';

import { useState } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { Lock } from 'lucide-react';
import WalletGateModal from './WalletGateModal';

interface FeaturedMarketCardProps {
  onNavigate: () => void;
}

export default function FeaturedMarketCard({ onNavigate }: FeaturedMarketCardProps) {
  const userFriendlyAddress = useTonAddress();
  const isWalletConnected = !!userFriendlyAddress;
  const [showGateModal, setShowGateModal] = useState(false);

  const handleCardTap = () => {
    if (isWalletConnected) {
      onNavigate();
    } else {
      setShowGateModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleCardTap}
        className="w-full text-left bg-white/5 border border-white/10 rounded-[24px] p-1 relative group active:scale-[0.98] transition-transform"
      >
        {/* Lock indicator when wallet not connected */}
        {!isWalletConnected && (
          <div className="absolute top-3 right-3 z-10 bg-white/10 p-1.5 rounded-lg">
            <Lock size={14} className="text-white/50" />
          </div>
        )}

        <div className="bg-[#0A0A0A] rounded-[20px] p-4 border border-white/5">
          <div className="flex justify-between items-start mb-3">
            <div className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
              Cricket World Cup
            </div>
            <span className="text-white/30 text-[10px] font-mono">ID: #8821</span>
          </div>
          <h4 className="text-white font-bold text-lg mb-1">India vs Pakistan</h4>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden flex mt-3">
            <div className="h-full bg-green-500 w-[65%]" />
            <div className="h-full bg-red-500 w-[35%]" />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono font-medium">
            <span className="text-green-400">IND 65%</span>
            <span className="text-red-400">PAK 35%</span>
          </div>
        </div>
      </button>

      {/* Hint text when locked */}
      {!isWalletConnected && (
        <p className="text-white/30 text-[10px] text-center mt-2">
          Wallet required to trade
        </p>
      )}

      {/* Wallet Gate Modal */}
      <WalletGateModal
        isOpen={showGateModal}
        onClose={() => setShowGateModal(false)}
      />
    </>
  );
}
