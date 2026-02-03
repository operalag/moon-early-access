'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useTonAddress } from '@tonconnect/ui-react';

export interface EducationStatus {
  isEducationComplete: boolean;
  isWalletConnected: boolean;
  shouldShowIndicator: boolean;
  loading: boolean;
}

export function useEducationStatus(): EducationStatus {
  const { user } = useTelegram();
  const walletAddress = useTonAddress();
  const [isEducationComplete, setIsEducationComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEducationStatus() {
      if (!user?.id) return;

      try {
        const res = await fetch(`/api/education/progress?userId=${user.id}&moduleId=module-1`);
        if (res.ok) {
          const data = await res.json();
          setIsEducationComplete(!!data.progress?.completed_at);
        }
      } catch (error) {
        console.error('Error fetching education status:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEducationStatus();
  }, [user?.id]);

  const isWalletConnected = !!walletAddress;
  const shouldShowIndicator = !loading && !isEducationComplete && !isWalletConnected;

  return {
    isEducationComplete,
    isWalletConnected,
    shouldShowIndicator,
    loading,
  };
}
