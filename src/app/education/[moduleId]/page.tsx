'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import educationData from '@/data/education_modules.json';
import SlideEngine from '@/components/education/SlideEngine';
import type { UnlockContext } from '@/components/education/SlideEngine';
import type { EducationModulesData, Module, Slide } from '@/lib/educationTypes';

const typedEducationData = educationData as EducationModulesData;

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useTelegram();
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<Module | null>(null);
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Find the module from JSON
  useEffect(() => {
    const foundModule = typedEducationData.modules.find((m) => m.id === moduleId);
    setModule(foundModule || null);
  }, [moduleId]);

  // Find the next module that this one unlocks
  const unlockContext: UnlockContext | undefined = (() => {
    if (!module) return undefined;
    const nextModule = typedEducationData.modules.find(
      (m) => m.prerequisiteModuleId === module.id
    );
    if (!nextModule) return undefined;
    return {
      nextModuleTitle: nextModule.title,
      nextModuleIcon: nextModule.icon,
    };
  })();

  // Fetch user progress for this module
  useEffect(() => {
    async function fetchProgress() {
      if (!user?.id || !moduleId) return;

      try {
        const res = await fetch(`/api/education/progress?userId=${user.id}&moduleId=${moduleId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.progress) {
            setInitialSlideIndex(data.progress.slide_index || 0);
            setIsCompleted(!!data.progress.completed_at);
          }
        }
      } catch (error) {
        console.error('Error fetching module progress:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgress();
  }, [user?.id, moduleId]);

  // Persist slide progress
  const handleSlideChange = useCallback(
    async (index: number) => {
      if (!user?.id || !moduleId) return;

      try {
        await fetch('/api/education/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            moduleId,
            slideIndex: index,
          }),
        });
      } catch (error) {
        console.error('Error saving slide progress:', error);
      }
    },
    [user?.id, moduleId]
  );

  // Handle module completion
  const handleComplete = useCallback(async () => {
    // Try to save completion if we have user context
    if (user?.id && moduleId && module) {
      try {
        await fetch('/api/education/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            moduleId,
            pointsAmount: module.totalPoints,
            badgeId: module.badgeId,
          }),
        });
      } catch (error) {
        console.error('Error completing module:', error);
      }
    }

    // Always navigate back regardless of API success
    router.push('/education');
  }, [user?.id, moduleId, module, router]);

  // Module not found
  if (!isLoading && !module) {
    return (
      <main className="min-h-screen bg-[#050505] p-6 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">Module not found</p>
          <Link
            href="/education"
            className="text-amber-500 hover:text-amber-400 font-medium"
          >
            Return to Modules
          </Link>
        </div>
      </main>
    );
  }

  // Loading state
  if (isLoading || !module) {
    return (
      <main className="min-h-screen bg-[#050505] p-6 text-white">
        <div className="max-w-md mx-auto">
          <div className="h-8 w-32 bg-white/5 rounded animate-pulse mb-6" />
          <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </main>
    );
  }

  // Completed state - show summary
  if (isCompleted) {
    return (
      <main className="min-h-screen bg-[#050505] p-6 text-white">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pt-4">
            <Link
              href="/education"
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-zinc-400" />
            </Link>
            <h1 className="text-lg font-bold">{module.title}</h1>
          </div>

          {/* Completion Summary */}
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
              <Trophy size={40} className="text-amber-500" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Module Complete!</h2>
            <p className="text-white/60 mb-6">You earned the {module.badgeName} badge.</p>

            {/* Badge Display */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-8">
              <span className="text-2xl">{module.icon}</span>
              <span className="text-amber-500 font-bold">{module.badgeName}</span>
            </div>

            {/* Points earned */}
            <p className="text-sm text-white/50 mb-8">
              +{module.totalPoints.toLocaleString()} points earned
            </p>

            {/* Return button */}
            <Link
              href="/education"
              className="w-full max-w-xs py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl text-center active:scale-[0.98] transition-transform"
            >
              Return to Modules
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Active module - render SlideEngine
  return (
    <main className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5">
        <Link
          href="/education"
          className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-zinc-400" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl">{module.icon}</span>
          <h1 className="text-sm font-bold">{module.title}</h1>
        </div>
      </div>

      {/* SlideEngine */}
      <div className="flex-1 overflow-hidden">
        <SlideEngine
          slides={module.slides as Slide[]}
          initialSlideIndex={initialSlideIndex}
          onSlideChange={handleSlideChange}
          onComplete={handleComplete}
          unlockContext={unlockContext}
        />
      </div>
    </main>
  );
}
