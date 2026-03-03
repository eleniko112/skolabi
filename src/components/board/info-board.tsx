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
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary font-headline">
                        <Megaphone className="h-6 w-6"/>
                        განცხადებები
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center bg-muted/20 flex-grow p-6">
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
        <Card className="w-full shadow-xl rounded-xl flex flex-col overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-headline">
                    <Megaphone className="h-6 w-6"/>
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
                            <div className="p-4 md:p-6 flex-grow flex flex-col space-y-2">
                                <h2 className="text-2xl md:text-3xl font-bold font-headline text-foreground flex-shrink-0">
                                    {ann.title}
                                </h2>
                                <p className="text-base text-muted-foreground">
                                    {ann.content}
                                </p>
                            </div>
                          </div>
                        </CarouselItem>
                    ))}
                  </CarouselContent>
                  {filteredAnnouncements.length > 1 && (
                    <>
                      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-background/50 hover:bg-background/80" />
                      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-background/50 hover:bg-background/80" />
                    </>
                  )}
                </Carousel>
          </CardContent>
        </Card>
    );
}
