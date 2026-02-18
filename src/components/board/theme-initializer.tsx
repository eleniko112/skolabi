"use client";

import { useEffect } from 'react';
import { THEME_KEY_PREFIX, type Theme } from '@/lib/theme';

export function ThemeInitializer({ schoolId }: { schoolId: string }) {
  useEffect(() => {
    const storageKey = `${THEME_KEY_PREFIX}${schoolId}`;
    
    const applyTheme = () => {
      const root = document.documentElement;
      try {
        const savedThemeJson = localStorage.getItem(storageKey);

        if (savedThemeJson) {
          const savedTheme: Theme = JSON.parse(savedThemeJson);
          root.style.setProperty('--background', savedTheme.background);
          root.style.setProperty('--primary', savedTheme.primary);
          root.style.setProperty('--accent', savedTheme.accent);
        } else {
          // If no theme is in storage, remove the inline styles to revert to globals.css
          root.style.removeProperty('--background');
          root.style.removeProperty('--primary');
          root.style.removeProperty('--accent');
        }
      } catch (error) {
        console.error("Could not apply theme:", error);
        // On error, revert to CSS file
        root.style.removeProperty('--background');
        root.style.removeProperty('--primary');
        root.style.removeProperty('--accent');
      }
    };

    applyTheme();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey) {
        applyTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [schoolId]);

  return null; // This component doesn't render anything
}
