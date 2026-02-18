"use client"; // Needs to be client component for hooks

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InfoBoard } from '@/components/board/info-board';
import { ScheduleTimer } from '@/components/board/schedule-timer';
import { QRCodeDisplay } from '@/components/board/qr-code-display';
import Image from 'next/image';
import { Settings, School as SchoolIcon, Loader2 } from 'lucide-react';
import { EmergencyOverlay } from '@/components/board/emergency-overlay';
import { getSchoolById } from '@/lib/schools';
import { School } from '@/lib/types';


export default function BoardPage() {
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId;
  const [schoolInfo, setSchoolInfo] = useState<School | null | undefined>(undefined);

  useEffect(() => {
    if (!schoolId) return;
    const school = getSchoolById(schoolId);
    setSchoolInfo(school);
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'schools-data') {
           const updatedSchool = getSchoolById(schoolId);
           setSchoolInfo(updatedSchool);
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [schoolId]);

  if (schoolInfo === undefined || !schoolId) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (schoolInfo === null) {
      return <div className="flex min-h-screen items-center justify-center"><p>School not found.</p></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EmergencyOverlay />
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm sticky top-0 z-20">
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
        <Button asChild variant="outline" size="icon">
          <Link href={`/board/${schoolId}/admin`}>
            <Settings className="h-6 w-6" />
            <span className="sr-only">ადმინის პანელი</span>
          </Link>
        </Button>
      </header>
      
      <main className="flex-grow flex flex-col md:flex-row p-6 gap-6">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <ScheduleTimer schoolId={schoolId} />
        </div>
        <div className="w-full md:w-2/3 lg:w-3/4">
          <InfoBoard schoolId={schoolId} />
        </div>
      </main>
      
      <footer className="p-4">
        <QRCodeDisplay />
      </footer>
    </div>
  );
}
