"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InfoBoard } from '@/components/board/info-board';
import { ScheduleTimer } from '@/components/board/schedule-timer';
import { QRCodeDisplay } from '@/components/board/qr-code-display';
import Image from 'next/image';
import { Settings, School as SchoolIcon, Home, Loader2 } from 'lucide-react';
import { getSchoolById } from '@/lib/schools';
import { School } from '@/lib/types';
import { EmergencyOverlay } from '@/components/board/emergency-overlay';

export default function BoardPage() {
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId;
  const [schoolInfo, setSchoolInfo] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (schoolId) {
      const info = getSchoolById(schoolId);
      setSchoolInfo(info);
      setIsLoading(false);
    }
  }, [schoolId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!schoolId || !schoolInfo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold">სკოლა არ მოიძებნა.</p>
        <Button asChild variant="outline">
          <Link href="/">მთავარზე დაბრუნება</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <EmergencyOverlay schoolId={schoolId} />
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-card shadow-sm z-20">
        <div className="flex items-center gap-4">
          {schoolInfo.logoUrl ? (
            <Image
              src={schoolInfo.logoUrl}
              alt={`${schoolInfo.name} Logo`}
              width={50}
              height={50}
              className="rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
             <div className="h-[50px] w-[50px] rounded-full bg-muted flex items-center justify-center border-2 border-primary/20">
                <SchoolIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <h1 className="text-3xl font-bold font-headline text-primary">{schoolInfo.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <QRCodeDisplay schoolId={schoolId} />
          <Button asChild variant="outline" size="icon">
            <Link href="/">
              <Home className="h-6 w-6" />
              <span className="sr-only">მთავარი გვერდი</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href={`/board/${schoolId}/admin`}>
              <Settings className="h-6 w-6" />
              <span className="sr-only">ადმინის პანელი</span>
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-[40%_60%] gap-6 overflow-y-auto">
        <ScheduleTimer schoolId={schoolId} />
        <InfoBoard schoolId={schoolId} />
      </main>
    </div>
  );
}
