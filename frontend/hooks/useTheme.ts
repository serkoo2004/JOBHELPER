'use client';

import { useCallback, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

const storageKey = 'career-copilot-theme';

const getSystemTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') {
    return;
  }

  const resolvedTheme = mode === 'system' ? getSystemTheme() : mode;
  const root = document.documentElement;
  root.classList.add('theme-transitioning');
  root.dataset.theme = resolvedTheme;
  window.setTimeout(() => root.classList.remove('theme-transitioning'), 350);
};

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('system');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedTheme = (window.localStorage.getItem(storageKey) as ThemeMode | null) ?? 'system';
    setThemeState(storedTheme);
    applyTheme(storedTheme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (((window.localStorage.getItem(storageKey) as ThemeMode | null) ?? 'system') === 'system') {
        applyTheme('system');
      }
    };

    media.addEventListener('change', handleMediaChange);
    return () => media.removeEventListener('change', handleMediaChange);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, mode);
    }
    applyTheme(mode);
  }, []);

  return {
    theme,
    resolvedTheme: theme === 'system' ? getSystemTheme() : theme,
    setTheme,
  };
}
