"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getAnnouncements, ANNOUNCEMENTS_KEY_PREFIX } from '@/lib/announcements';
import { defaultSchedule, SCHEDULE_KEY_PREFIX, SchedulePeriod } from '@/lib/schedule';
import { getSchoolById } from '@/lib/schools';
import { Announcement, School } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Megaphone, Loader2, School as SchoolIcon } from 'lucide-react';
import { EmergencyOverlay } from '@/components/board/emergency-overlay';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);


export default function MobileSchoolPage() {
    const params = useParams<{ schoolId: string }>();
    const schoolId = params.schoolId;

    const [school, setSchool] = useState<School | null | undefined>();
    const [schedule, setSchedule] = useState<SchedulePeriod[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!schoolId) return;

        const loadData = () => {
            const schoolData = getSchoolById(schoolId);
            setSchool(schoolData);

            const scheduleData = localStorage.getItem(`${SCHEDULE_KEY_PREFIX}${schoolId}`);
            setSchedule(scheduleData ? JSON.parse(scheduleData) : defaultSchedule);

            const allAnnouncements = getAnnouncements(schoolId);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const activeAnnouncements = allAnnouncements.filter(ann => {
                try {
                    const startDate = new Date(ann.startDate);
                    const endDate = new Date(ann.endDate);
                    startDate.setHours(0,0,0,0);
                    endDate.setHours(0,0,0,0);
                    return ann.isActive && startDate <= today && endDate >= today;
                } catch (e) {
                    return false;
                }
            });
            setAnnouncements(activeAnnouncements);

            setLoading(false);
        }
        
        loadData();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'schools-data' || event.key === `${SCHEDULE_KEY_PREFIX}${schoolId}` || event.key === `${ANNOUNCEMENTS_KEY_PREFIX}${schoolId}`) {
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

    }, [schoolId]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!school) {
        return <div className="flex min-h-screen items-center justify-center"><p>School not found.</p></div>;
    }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 font-body">
      <EmergencyOverlay />
      <header className="text-center my-6 flex flex-col items-center gap-3">
        {school.logoUrl ? (
            <Image src={school.logoUrl} alt={`${school.name} Logo`} width={60} height={60} className="rounded-full object-cover"/>
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
            <ul className="space-y-4">
              {schedule
                .sort((a,b) => a.startTime.localeCompare(b.startTime))
                .map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-base font-medium">{item.label}</span>
                  <Badge variant="secondary" className="text-sm tabular-nums">{item.startTime} - {item.endTime}</Badge>
                </li>
              ))}
            </ul>
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
                    {announcements.length > 0 ? announcements.map((ann, index) => {
                        const image = ann.imageUrl;
                        return (
                            <div key={ann.id}>
                                {index > 0 && <Separator className="my-6" />}
                                <div className="space-y-3">
                                    {image && (
                                        <div className="w-full overflow-hidden rounded-lg">
                                            <Image 
                                                src={image}
                                                alt={ann.title}
                                                width={600}
                                                height={400}
                                                className="object-cover w-full aspect-video"
                                                data-ai-hint={ann.imageHint}
                                            />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-xl font-headline pt-2">{ann.title}</h3>
                                    <p className="text-base text-muted-foreground">{ann.content}</p>
                                </div>
                            </div>
                        )
                    }) : (
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
