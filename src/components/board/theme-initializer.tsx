"use client";

import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { THEME_KEY_PREFIX } from '@/lib/theme';
import { type Theme } from '@/lib/types';

export function ThemeInitializer({ schoolId }: { schoolId: string }) {
  const [theme] = useLocalStorage<Theme | null>(`${THEME_KEY_PREFIX}${schoolId}`, null);
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme) {
        root.style.setProperty('--background', theme.background);
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--accent', theme.accent);
    } else {
      // If no theme is in storage, remove the inline styles to revert to globals.css
      root.style.removeProperty('--background');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
    }
  }, [theme]);

  return null; // This component doesn't render anything
}
