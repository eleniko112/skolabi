"use client";

import { useEffect, useState } from 'react';
import { SchoolSelector } from '@/components/school-selector';
import { type School } from '@/lib/types';
import { Building, Loader2 } from 'lucide-react';
import { getSchools } from '@/lib/schools';

export default function Home() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with default schools if none are in local storage
    getSchools(true); 
    setSchools(getSchools());
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
        </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center mb-16">
        <h1 className="font-headline text-6xl font-bold text-primary tracking-tight flex items-center gap-4">
          <Building className="w-14 h-14" />
          სკოლის დაფა
        </h1>
        <p className="text-muted-foreground mt-4 text-xl">
          აირჩიეთ თქვენი სკოლა გასაგრძელებლად
        </p>
      </div>
      <SchoolSelector schools={schools} />
    </main>
  );
}
