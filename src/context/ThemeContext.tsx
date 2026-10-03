import { createContext, useContext, useLayoutEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextValue {
  theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark');
    root.classList.add('theme-light');
    root.style.colorScheme = 'light';
    try {
      window.localStorage.removeItem('bidzo-theme');
      window.localStorage.removeItem('dream-spex-theme');
    } catch {
      // Theme no longer depends on local storage.
    }
  }, []);

  const value = useMemo(() => ({ theme: 'light' as const }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
}
