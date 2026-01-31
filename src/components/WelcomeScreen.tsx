'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface WelcomeProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-end pb-8">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/bg-welcome.png" 
          alt="Welcome" 
          className="w-full h-full object-cover opacity-70"
        />
        {/* Shading Layer (Vignette + Gradient) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 p-8 w-full max-w-md text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-6xl font-black text-white tracking-tighter mb-2 drop-shadow-2xl">
            MOON<span className="text-yellow-500">.</span>
          </h1>
          <p className="text-sm font-bold text-white/60 uppercase tracking-[0.4em]">Prediction Market</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] shadow-2xl"
        >
          <p className="text-base text-zinc-100 leading-relaxed font-semibold mb-4">
            Engage, collect points, and be the first to access the cricket prediction market on TON.
          </p>
          <div className="w-12 h-1 bg-yellow-500 mx-auto mb-4 rounded-full" />
          <p className="text-[11px] text-yellow-500 font-black uppercase tracking-[0.1em] leading-tight">
            Top 500 on the leaderboard will be awarded $HNCH oracle tokens.
          </p>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full bg-white text-black font-black text-2xl py-6 rounded-[28px] flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:bg-zinc-100 transition-all"
        >
          <span>START</span>
          <ArrowRight size={24} strokeWidth={4} />
        </motion.button>
      </div>
    </div>
  );
}