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
      } else {
        // MOCK USER FOR BROWSER TESTING
        // This allows testing in Chrome without Telegram
        console.warn("MOON: Running in Dev Mode (Mock User)");
        setUser({
          id: 777000, // Fixed Test ID
          first_name: "Test Analyst",
          username: "moon_tester",
          photo_url: ""
        });
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
