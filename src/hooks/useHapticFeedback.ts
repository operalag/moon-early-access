'use client';

import { useTelegram } from './useTelegram';

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotificationType = 'success' | 'error' | 'warning';

export function useHapticFeedback() {
  const { webApp } = useTelegram();

  const impactOccurred = (style: ImpactStyle) => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    }
    // Silent fail in browser - no haptic hardware
  };

  const notificationOccurred = (type: NotificationType) => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  };

  const selectionChanged = () => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged();
    }
  };

  return { impactOccurred, notificationOccurred, selectionChanged };
}
