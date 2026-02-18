"use client";

import { useMemo } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Autoplay from "embla-carousel-autoplay"
import { Announcement } from '@/lib/types';
import { Megaphone, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


export function InfoBoard({ schoolId }: { schoolId: string }) {
  const firestore = useFirestore();

  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    
    const today = new Date().toISOString().split('T')[0];

    return query(
        collection(firestore, 'schools', schoolId, 'announcements'),
        where('isActive', '==', true),
        where('startDate', '<=', today)
    );
  }, [firestore, schoolId]);

  const { data: announcements, isLoading } = useCollection<Announcement>(announcementsQuery);

  const activeAnnouncements = useMemo(() => {
    if (!announcements) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return announcements.filter(ann => {
        try {
            const endDate = new Date(ann.endDate);
            endDate.setHours(0,0,0,0);
            return endDate >= today;
        } catch (e) {
            return false;
        }
    });
  }, [announcements]);
  

  if (isLoading) {
      return (
        <Card className="h-full w-full shadow-xl overflow-hidden rounded-xl">
            <CardContent className="p-0 h-full flex items-center justify-center bg-muted/20">
                 <div className="text-center text-muted-foreground">
                    <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin" />
                    <h2 className="text-2xl font-semibold font-headline">იტვირთება განცხადებები...</h2>
                </div>
            </CardContent>
        </Card>
      )
  }

  if (activeAnnouncements.length === 0) {
    return (
        <Card className="h-full w-full shadow-xl overflow-hidden rounded-xl">
            <CardContent className="p-0 h-full flex items-center justify-center bg-muted/20">
                <div className="text-center text-muted-foreground">
                    <Megaphone className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold font-headline">ამჟამად აქტიური განცხადებები არ არის</h2>
                    <p className="mt-2">გთხოვთ, შეამოწმოთ მოგვიანებით.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="h-full w-full shadow-xl overflow-hidden rounded-xl">
      <CardContent className="p-0 h-full">
        <Carousel 
            className="w-full h-full"
            plugins={[
                Autoplay({
                  delay: 7000,
                  stopOnInteraction: true,
                }),
            ]}
            opts={{
                loop: activeAnnouncements.length > 1,
            }}
        >
          <CarouselContent className="h-full">
            {activeAnnouncements.map((ann) => {
              return (
                <CarouselItem key={ann.id} className="h-full">
                  <div className="relative w-full h-full">
                    {ann.imageUrl && (
                      <Image
                        src={ann.imageUrl}
                        alt={ann.title}
                        fill
                        className="object-cover"
                        data-ai-hint={ann.imageHint}
                        priority
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                        <h2 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-2xl animate-in fade-in-5 slide-in-from-bottom-5 duration-500">
                            {ann.title}
                        </h2>
                        <p className="mt-4 text-xl max-w-4xl drop-shadow-xl animate-in fade-in-5 slide-in-from-bottom-3 duration-500 delay-200">
                            {ann.content}
                        </p>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          {activeAnnouncements.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none h-12 w-12" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none h-12 w-12" />
            </>
          )}
        </Carousel>
      </CardContent>
    </Card>
  );
}
