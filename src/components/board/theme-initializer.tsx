"use client";

import { useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { type Theme } from '@/lib/types';

export function ThemeInitializer({ schoolId }: { schoolId: string }) {
  const firestore = useFirestore();

  const themeDocRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId, 'config', 'theme');
  }, [firestore, schoolId]);

  const { data: theme } = useDoc<Theme>(themeDocRef);
  
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
