'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function TonProvider({ children }: { children: React.ReactNode }) {
  const manifestUrl = 'https://prediction-early-access.vercel.app/tonconnect-manifest.json';

  // Always wrap with TonConnectUIProvider so useTonAddress hooks work everywhere.
  // The SDK handles SSR internally - it won't attempt browser-only operations during SSR.
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
