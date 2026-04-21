import { useEffect, useState } from 'react';

export function useTelegram() {
  const [telegram, setTelegram] = useState({
    isTelegram: false,
    ready: false,
    user: null,
    platform: 'browser',
    colorScheme: 'dark',
    isExpanded: false,
  });

  useEffect(() => {
    const webApp = typeof window === 'undefined' ? null : window.Telegram?.WebApp;

    if (!webApp) {
      return;
    }

    webApp.ready();
    webApp.expand();
    webApp.setHeaderColor?.('#020617');
    webApp.setBackgroundColor?.('#020617');

    setTelegram({
      isTelegram: true,
      ready: true,
      user: webApp.initDataUnsafe?.user ?? null,
      platform: webApp.platform ?? 'telegram',
      colorScheme: webApp.colorScheme ?? 'dark',
      isExpanded: webApp.isExpanded ?? false,
    });
  }, []);

  return telegram;
}
