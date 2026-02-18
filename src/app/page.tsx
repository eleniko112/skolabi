"use client"; // Make it a client component to use hooks

import { useState, useEffect } from 'react';
import { SchoolSelector } from '@/components/school-selector';
import { School } from '@/lib/types';
import { getSchools } from '@/lib/schools';
import { Building } from 'lucide-react';

export default function Home() {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    // Load schools from localStorage on the client
    setSchools(getSchools());
  }, []);

  if (schools.length === 0) {
    // Optional: show a loading state
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Building className="w-12 h-12 animate-pulse text-primary" />
        </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold text-primary flex items-center gap-4">
          <Building className="w-12 h-12" />
          სკოლის დაფა
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          აირჩიეთ თქვენი სკოლა გასაგრძელებლად
        </p>
      </div>
      <SchoolSelector schools={schools} />
    </main>
  );
}
