
"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from "embla-carousel-autoplay"
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Megaphone, Loader2 } from 'lucide-react';
import { Announcement } from '@/lib/types';

export function InfoBoard({ schoolId }: { schoolId: string }) {
    const firestore = useFirestore();
    
    const announcementsQuery = useMemoFirebase(() => {
        if (!firestore || !schoolId) return null;
        return query(
            collection(firestore, 'schools', schoolId, 'announcements'),
            where('isActive', '==', true)
        );
    }, [firestore, schoolId]);

    const { data: activeAnnouncements, isLoading } = useCollection<Announcement>(announcementsQuery);

    const filteredAnnouncements = useMemo(() => {
        if (!activeAnnouncements) return [];
        const today = new Date().toISOString().split('T')[0];
        return activeAnnouncements.filter(ann => ann.startDate <= today && ann.endDate >= today);
    }, [activeAnnouncements]);

    if (isLoading) {
        return (
            <Card className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
        );
    }

    if (!filteredAnnouncements || filteredAnnouncements.length === 0) {
        return (
            <Card className="w-full shadow-xl rounded-xl flex flex-col">
                 <CardHeader className="p-3 md:p-4">
                    <CardTitle className="flex items-center gap-2 text-primary font-headline text-lg md:text-xl">
                        <Megaphone className="h-5 w-5"/>
                        განცხადებები
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center bg-muted/20 flex-grow p-6">
                    <div className="text-center text-muted-foreground">
                        <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <h2 className="text-xl font-semibold font-headline">აქტიური განცხადებები არ არის</h2>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full shadow-xl rounded-xl flex flex-col overflow-hidden border">
            <CardHeader className="bg-muted/30 p-2 md:p-3">
                <CardTitle className="flex items-center gap-2 text-primary font-headline text-sm sm:text-base md:text-lg">
                    <Megaphone className="h-4 w-4 md:h-5 md:w-5"/>
                    განცხადებები
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow relative">
                <Carousel 
                    className="w-full"
                    plugins={[
                        Autoplay({
                          delay: 7000,
                          stopOnInteraction: true,
                        }),
                    ]}
                    opts={{
                        loop: filteredAnnouncements.length > 1,
                    }}
                >
                  <CarouselContent>
                    {filteredAnnouncements.map((ann, index) => (
                        <CarouselItem key={ann.id}>
                          <div className="flex flex-col w-full">
                            {ann.imageUrl && (
                              <div className="w-full aspect-video relative overflow-hidden flex-shrink-0 bg-muted">
                                <Image
                                  src={ann.imageUrl}
                                  alt={ann.title}
                                  fill
                                  className="object-cover"
                                  data-ai-hint={ann.imageHint}
                                  priority={index === 0}
                                />
                              </div>
                            )}
                            <div className="p-3 md:p-4 flex-grow flex flex-col space-y-1">
                                <h2 className="text-xl md:text-2xl font-bold font-headline text-foreground flex-shrink-0 leading-tight">
                                    {ann.title}
                                </h2>
                                <p className="text-sm md:text-base text-muted-foreground">
                                    {ann.content}
                                </p>
                            </div>
                          </div>
                        </CarouselItem>
                    ))}
                  </CarouselContent>
                  {filteredAnnouncements.length > 1 && (
                    <>
                      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/50 hover:bg-background/80" />
                      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/50 hover:bg-background/80" />
                    </>
                  )}
                </Carousel>
          </CardContent>
        </Card>
    );
}
