'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { useTonAddress } from '@tonconnect/ui-react';
import educationData from '@/data/education_modules.json';
import ModuleCard from '@/components/education/ModuleCard';
import type { EducationModulesData, UserEducationProgress } from '@/lib/educationTypes';

const typedEducationData = educationData as EducationModulesData;

export default function EducationPage() {
  const { user } = useTelegram();
  const walletAddress = useTonAddress();
  const [progressMap, setProgressMap] = useState<Record<string, UserEducationProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  const isWalletConnected = !!walletAddress;

  useEffect(() => {
    async function fetchProgress() {
      if (!user?.id) return;

      try {
        const res = await fetch(`/api/education/progress?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          // Convert array to map keyed by module_id
          const map: Record<string, UserEducationProgress> = {};
          if (Array.isArray(data.progress)) {
            data.progress.forEach((p: UserEducationProgress) => {
              map[p.module_id] = p;
            });
          }
          setProgressMap(map);
        }
      } catch (error) {
        console.error('Error fetching education progress:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgress();
  }, [user?.id]);

  // Compute lock state with reason for UI differentiation
  const computeLockState = (moduleId: string, prerequisiteModuleId: string | null): { isLocked: boolean; lockReason: 'prerequisite' | 'wallet' | null } => {
    // Check prerequisite first
    if (prerequisiteModuleId) {
      const prereqProgress = progressMap[prerequisiteModuleId];
      if (!prereqProgress?.completed_at) {
        return { isLocked: true, lockReason: 'prerequisite' };
      }
    }

    // Check wallet gate (Module 2+ requires wallet)
    if (moduleId !== 'module-1' && !isWalletConnected) {
      return { isLocked: true, lockReason: 'wallet' };
    }

    return { isLocked: false, lockReason: null };
  };

  return (
    <main className="min-h-screen bg-[#050505] p-6 pb-24 text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pt-4">
          <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider">Net Practice</h1>
            <p className="text-xs text-white/50">Learn to trade like a pro</p>
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeletons
            [1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
            ))
          ) : typedEducationData.modules.length === 0 ? (
            // Empty state
            <div className="text-center py-12 text-white/20">
              <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm font-bold uppercase tracking-widest">No Modules Yet</p>
              <p className="text-xs mt-2">Check back soon for new content.</p>
            </div>
          ) : (
            // Module cards
            typedEducationData.modules.map((module) => {
              const { isLocked, lockReason } = computeLockState(module.id, module.prerequisiteModuleId);
              const progress = progressMap[module.id] || null;

              return (
                <ModuleCard
                  key={module.id}
                  module={module}
                  progress={progress}
                  isLocked={isLocked}
                  lockReason={lockReason}
                />
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
