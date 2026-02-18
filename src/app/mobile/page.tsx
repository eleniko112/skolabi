"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSchools } from '@/lib/schools';
import { School } from '@/lib/types';
import { Building, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function MobileHome() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSchools(getSchools(true));
    setIsLoading(false);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold text-primary flex items-center gap-3">
          <Building className="w-8 h-8" />
          სკოლის დაფა
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          აირჩიეთ სკოლა მობილური ვერსიის სანახავად
        </p>
      </div>

      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      ) : (
        <div className="w-full max-w-md space-y-4">
          {schools.map((school) => (
            <Link href={`/mobile/${school.id}`} key={school.id}>
              <Card className="w-full cursor-pointer transition-all transform hover:shadow-lg hover:border-primary border">
                <CardHeader className="items-center text-center p-6">
                  <CardTitle className="font-headline text-xl">{school.name}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
