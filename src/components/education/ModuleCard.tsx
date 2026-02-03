'use client';

import Link from 'next/link';
import { Check, Lock, ChevronRight, Wallet } from 'lucide-react';
import type { Module, UserEducationProgress } from '@/lib/educationTypes';

interface ModuleCardProps {
  module: Module;
  progress: UserEducationProgress | null;
  isLocked: boolean;
  lockReason?: 'prerequisite' | 'wallet' | null;
}

export default function ModuleCard({ module, progress, isLocked, lockReason }: ModuleCardProps) {
  const isCompleted = !!progress?.completed_at;
  const hasBadge = !!progress?.badge_earned;

  const cardContent = (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        isLocked
          ? 'bg-white/[0.02] border-white/5 opacity-50'
          : hasBadge
          ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
          : isCompleted
          ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      {/* Module Icon */}
      <div className="text-3xl">{module.icon}</div>

      {/* Module Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-sm truncate">{module.title}</h3>
        <p className="text-xs text-white/50 truncate">{module.description}</p>

        {/* Badge Pill */}
        {hasBadge && (
          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full">
            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wide">
              {module.badgeName}
            </span>
          </span>
        )}

        {/* Wallet Lock Teaser */}
        {lockReason === 'wallet' && (
          <div className="mt-2 flex items-center gap-1.5">
            <Wallet size={12} className="text-yellow-500/70" />
            <span className="text-[10px] text-yellow-500/70 font-medium">
              Connect wallet to unlock
            </span>
          </div>
        )}
      </div>

      {/* Status Icon */}
      <div className="flex-shrink-0">
        {isLocked ? (
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <Lock size={16} className="text-white/30" />
          </div>
        ) : isCompleted ? (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check size={16} className="text-green-500" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <ChevronRight size={16} className="text-white/60" />
          </div>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return <div className="cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link href={`/education/${module.id}`} className="block">
      {cardContent}
    </Link>
  );
}
