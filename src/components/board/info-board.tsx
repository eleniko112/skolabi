"use client";

import { useState, useEffect } from 'react';
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
import { getAnnouncements, initializeAnnouncements, ANNOUNCEMENTS_KEY_PREFIX } from '@/lib/announcements';
import { Announcement } from '@/lib/types';
import { Megaphone } from 'lucide-react';

export function InfoBoard({ schoolId }: { schoolId: string }) {
    const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const loadAnnouncements = () => {
            let active = getAnnouncements(schoolId, true);
            if (active.length === 0) {
                initializeAnnouncements(schoolId);
                active = getAnnouncements(schoolId, true);
            }
            setActiveAnnouncements(active);
        }

        loadAnnouncements();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === `${ANNOUNCEMENTS_KEY_PREFIX}${schoolId}`) {
                setActiveAnnouncements(getAnnouncements(schoolId, true));
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [schoolId]);

  if (activeAnnouncements.length === 0) {
    return (
        <Card className="w-full shadow-xl rounded-xl flex flex-col h-full">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-headline">
                    <Megaphone className="h-6 w-6"/>
                    განცხადებები
                </CardTitle>
            </CardHeader>
            <CardContent className="h-full flex items-center justify-center bg-muted/20 flex-grow">
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
    <Card className="w-full shadow-xl rounded-xl flex flex-col overflow-hidden h-full md:h-auto md:max-h-[80vh] lg:h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary font-headline">
                <Megaphone className="h-6 w-6"/>
                განცხადებები
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow relative">
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
                {activeAnnouncements.map((ann, index) => {
                  return (
                    <CarouselItem key={ann.id} className="h-full">
                      <div className="flex flex-col h-full w-full">
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
                  );
                })}
              </CarouselContent>
              {activeAnnouncements.length > 1 && (
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
