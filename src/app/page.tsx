"use client";

import Link from 'next/link';
import { SchoolSelector } from '@/components/school-selector';
import { type School } from '@/lib/types';
import { Building, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function Home() {
  const firestore = useFirestore();

  const schoolsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'schools');
  }, [firestore]);

  const { data: schools, isLoading } = useCollection<School>(schoolsQuery);

  if (isLoading) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
        </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="absolute top-8 right-8 z-10">
        <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors bg-white/50 backdrop-blur-sm border shadow-sm" title="სუპერ ადმინი">
          <Link href="/super-admin">
            <ShieldAlert className="h-6 w-6" />
            <span className="sr-only">სუპერ ადმინი</span>
          </Link>
        </Button>
      </div>

      <div className="text-center mb-16 relative z-10">
        <div className="inline-flex p-4 bg-primary/5 rounded-3xl mb-6 backdrop-blur-sm border border-primary/10">
            <Building className="w-16 h-16 text-primary" />
        </div>
        <h1 className="font-headline text-6xl md:text-7xl font-bold text-primary tracking-tight">
          სკოლის დაფა
        </h1>
        <p className="text-muted-foreground mt-4 text-xl max-w-lg mx-auto leading-relaxed">
          აირჩიეთ თქვენი სკოლა ციფრული საინფორმაციო დაფის სანახავად
        </p>
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <SchoolSelector schools={schools || []} />
      </div>
    </main>
  );
}
