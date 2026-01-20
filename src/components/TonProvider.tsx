'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';

export function TonProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const manifestUrl = 'https://moon-prediction.vercel.app/tonconnect-manifest.json'; 

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
