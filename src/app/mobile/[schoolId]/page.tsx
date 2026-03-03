"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Announcement, School, SchedulePeriod } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Megaphone, Loader2, School as SchoolIcon } from 'lucide-react';
import { EmergencyOverlay } from '@/components/board/emergency-overlay';
import { useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, orderBy, where } from 'firebase/firestore';

export default function MobileSchoolPage() {
    const params = useParams<{ schoolId: string }>();
    const schoolId = params.schoolId;
    const firestore = useFirestore();

    const schoolRef = useMemoFirebase(() => {
        if (!firestore || !schoolId) return null;
        return doc(firestore, 'schools', schoolId);
    }, [firestore, schoolId]);

    const lessonsQuery = useMemoFirebase(() => {
        if (!firestore || !schoolId) return null;
        return query(
            collection(firestore, 'schools', schoolId, 'lessons'),
            orderBy('startTime')
        );
    }, [firestore, schoolId]);

    const announcementsQuery = useMemoFirebase(() => {
        if (!firestore || !schoolId) return null;
        return query(
            collection(firestore, 'schools', schoolId, 'announcements'),
            where('isActive', '==', true)
        );
    }, [firestore, schoolId]);

    const { data: school, isLoading: schoolLoading } = useDoc<School>(schoolRef);
    const { data: schedule, isLoading: scheduleLoading } = useCollection<SchedulePeriod>(lessonsQuery);
    const { data: announcements, isLoading: annLoading } = useCollection<Announcement>(announcementsQuery);

    const filteredAnnouncements = useMemo(() => {
        if (!announcements) return [];
        const today = new Date().toISOString().split('T')[0];
        return announcements.filter(ann => ann.startDate <= today && ann.endDate >= today);
    }, [announcements]);

    if (schoolLoading || scheduleLoading || annLoading || !schoolId) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!school) {
        return <div className="flex min-h-screen items-center justify-center"><p>სკოლა არ მოიძებნა.</p></div>;
    }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 font-body">
      <EmergencyOverlay schoolId={schoolId} />
      <header className="text-center my-6 flex flex-col items-center gap-3">
        {school.logoUrl ? (
            <div className="relative h-[60px] w-[60px]">
              <Image src={school.logoUrl} alt={`${school.name} Logo`} fill className="rounded-full object-cover"/>
            </div>
        ) : (
            <div className="h-[60px] w-[60px] rounded-full bg-muted flex items-center justify-center">
                <SchoolIcon className="h-7 w-7 text-muted-foreground" />
            </div>
        )}
        <h1 className="text-3xl font-bold font-headline text-primary">{school.name}</h1>
        <p className="text-muted-foreground -mt-2">მობილური ვერსია</p>
      </header>

      <main className="space-y-8">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary font-headline">
              <Calendar className="h-5 w-5" />
              დღის განრიგი
            </CardTitle>
          </CardHeader>
          <CardContent>
            {schedule && schedule.length > 0 ? (
                <ul className="space-y-4">
                  {schedule.map((item, index) => (
                    <li key={item.id || index} className="flex items-center justify-between">
                      <span className="text-base font-medium">{item.label}</span>
                      <Badge variant="secondary" className="text-sm tabular-nums">{item.startTime} - {item.endTime}</Badge>
                    </li>
                  ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-center">განრიგი არ არის დამატებული.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg rounded-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-headline">
                    <Megaphone className="h-5 w-5" />
                    განცხადებები
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {filteredAnnouncements.length > 0 ? filteredAnnouncements.map((ann, index) => (
                        <div key={ann.id}>
                            {index > 0 && <Separator className="my-6" />}
                            <div className="space-y-3">
                                {ann.imageUrl && (
                                    <div className="w-full relative aspect-video overflow-hidden rounded-lg bg-muted">
                                        <Image 
                                            src={ann.imageUrl}
                                            alt={ann.title}
                                            fill
                                            className="object-cover"
                                            data-ai-hint={ann.imageHint}
                                        />
                                    </div>
                                )}
                                <h3 className="font-bold text-xl font-headline pt-2">{ann.title}</h3>
                                <p className="text-base text-muted-foreground">{ann.content}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-center">ამჟამად აქტიური განცხადებები არ არის.</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </main>

      <footer className="text-center mt-10 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} სკოლის დაფა. ყველა უფლება დაცულია.</p>
      </footer>
    </div>
  );
}
