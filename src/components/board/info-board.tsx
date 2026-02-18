"use client";

import { PlaceHolderImages } from '@/lib/placeholder-images';
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

// Dummy data, will be replaced with real-time Firestore data
const announcements = [
  {
    id: '1',
    title: 'ტრენინგი AI-ზე და ჩვენს მიდგომაზე',
    content: 'დღეს, 15:00 საათზე, სააქტო დარბაზში გაიმართება საინტერესო ტრენინგი ხელოვნურ ინტელექტზე. განვიხილავთ თანამედროვე ტექნოლოგიებს და მათ გამოყენებას განათლებაში. დასწრება თავისუფალია.',
    imageId: 'ai-training',
  },
  {
    id: '2',
    title: 'სასკოლო სპორტული დღე',
    content: 'მომავალ შაბათს, სკოლის სტადიონზე ჩატარდება ყოველწლიური სპორტული დღე. გელოდებით ყველას, მონაწილეობის მისაღებად და თქვენი კლასელების გასამხნევებლად!',
    imageId: 'sports-day',
  },
  {
    id: '3',
    title: 'საგაზაფხულო კონცერტი',
    content: 'მოემზადეთ! საგაზაფხულო კონცერტი გაიმართება 25 მაისს. ჩვენი ნიჭიერი მოსწავლეები წარმოგიდგენენ მუსიკალურ და თეატრალურ ნომრებს. ბილეთები მალე გაიყიდება.',
    imageId: 'school-concert',
  }
];

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export function InfoBoard({ schoolId }: { schoolId: string }) {
  // In a real app, you would use a hook here to fetch real-time data from Firestore
  // e.g., const { data: announcements, loading } = useFirestoreCollection(`schools/${schoolId}/announcements`);

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
        >
          <CarouselContent className="h-full">
            {announcements.map((ann) => {
              const image = getImage(ann.imageId);
              return (
                <CarouselItem key={ann.id} className="h-full">
                  <div className="relative w-full h-full">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={ann.title}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
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
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none h-12 w-12" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none h-12 w-12" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
