
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
            <Card className="w-full h-full shadow-xl rounded-xl flex flex-col border">
                 <CardHeader className="p-3 md:p-4 border-b bg-muted/10">
                    <CardTitle className="flex items-center gap-2 text-primary font-headline text-lg md:text-xl">
                        <Megaphone className="h-5 w-5"/>
                        განცხადებები
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center bg-muted/5 flex-grow p-6">
                    <div className="text-center text-muted-foreground">
                        <Megaphone className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <h2 className="text-2xl font-semibold font-headline">აქტიური განცხადებები არ არის</h2>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full h-full shadow-xl rounded-xl flex flex-col overflow-hidden border">
            <CardHeader className="bg-muted/30 p-3 md:p-4 border-b">
                <CardTitle className="flex items-center gap-2 text-primary font-headline text-lg md:text-xl">
                    <Megaphone className="h-5 w-5"/>
                    განცხადებები
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow relative overflow-hidden">
                <Carousel 
                    className="w-full h-full"
                    plugins={[
                        Autoplay({
                          delay: 8000,
                          stopOnInteraction: true,
                        }),
                    ]}
                    opts={{
                        loop: filteredAnnouncements.length > 1,
                    }}
                >
                  <CarouselContent className="h-full ml-0">
                    {filteredAnnouncements.map((ann, index) => (
                        <CarouselItem key={ann.id} className="h-full pl-0">
                          <div className="flex flex-col h-full w-full">
                            {ann.imageUrl && (
                              <div className="w-full aspect-video relative overflow-hidden flex-shrink-0 bg-muted shadow-inner">
                                <Image
                                  src={ann.imageUrl}
                                  alt={ann.title}
                                  fill
                                  className="object-cover"
                                  data-ai-hint={ann.imageHint || "school announcement"}
                                  priority={index === 0}
                                />
                              </div>
                            )}
                            <div className="flex-1 flex flex-col p-6 md:p-8 min-h-0">
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-headline text-foreground mb-4 leading-tight shrink-0">
                                    {ann.title}
                                </h2>
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                                        {ann.content}
                                    </p>
                                </div>
                            </div>
                          </div>
                        </CarouselItem>
                    ))}
                  </CarouselContent>
                  {filteredAnnouncements.length > 1 && (
                    <>
                      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 bg-background/40 hover:bg-background/80 backdrop-blur-sm border-none shadow-lg transition-all" />
                      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 bg-background/40 hover:bg-background/80 backdrop-blur-sm border-none shadow-lg transition-all" />
                    </>
                  )}
                </Carousel>
          </CardContent>
        </Card>
    );
}

