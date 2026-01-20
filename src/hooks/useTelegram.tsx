'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface TelegramContextType {
  user: any;
  webApp: any;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  webApp: null,
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    // Only import and initialize WebApp on the client
    const initTWA = async () => {
      const WebApp = (await import('@twa-dev/sdk')).default;
      WebApp.ready();
      setWebApp(WebApp);
      if (WebApp.initDataUnsafe?.user) {
        setUser(WebApp.initDataUnsafe.user);
      }
    };

    if (typeof window !== 'undefined') {
      initTWA();
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ user, webApp }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
