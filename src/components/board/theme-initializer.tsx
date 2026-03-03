"use client";

import { useEffect } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { School } from '@/lib/types';

export function ThemeInitializer({ schoolId }: { schoolId: string }) {
  const firestore = useFirestore();
  const schoolRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId);
  }, [firestore, schoolId]);

  const { data: school } = useDoc<School>(schoolRef);
  
  useEffect(() => {
    const root = document.documentElement;
    if (school) {
        if (school.backgroundColor) root.style.setProperty('--background', school.backgroundColor);
        if (school.themeColor) root.style.setProperty('--primary', school.themeColor);
        if (school.accentColor) root.style.setProperty('--accent', school.accentColor);
    }
  }, [school]);

  return null;
}
