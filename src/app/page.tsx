"use client";

import { useMemo } from 'react';
import { SchoolSelector } from '@/components/school-selector';
import { School } from '@/lib/types';
import { Building, Loader2, Database } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { seedInitialData } from '@/lib/seed';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const schoolsCollection = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'schools');
  }, [firestore]);

  const { data: schools, isLoading } = useCollection<School>(schoolsCollection);
  
  const handleSeedData = async () => {
    if (!firestore) return;
    try {
        await seedInitialData(firestore);
        toast({ title: "მონაცემთა ბაზა მომზადდა", description: "საწყისი მონაცემები წარმატებით ჩაიწერა." });
    } catch (error) {
        console.error("Failed to seed data:", error);
        toast({ title: "შეცდომა", description: "მონაცემების ჩაწერა ვერ მოხერხდა.", variant: 'destructive' });
    }
  }

  if (isLoading) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
        </main>
    );
  }

  if (!isLoading && schools && schools.length === 0) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
            <Database className="w-16 h-16 text-destructive mb-4" />
            <h2 className="font-headline text-3xl font-bold text-primary mb-2">მონაცემთა ბაზა ცარიელია</h2>
            <p className="text-muted-foreground mb-6">აპლიკაციის გამოსაყენებლად, გთხოვთ მოამზადოთ საწყისი მონაცემები.</p>
            <Button onClick={handleSeedData}>მონაცემთა ბაზის მომზადება</Button>
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
      <SchoolSelector schools={schools || []} />
    </main>
  );
}
