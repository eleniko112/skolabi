"use client";

import { Bell, Megaphone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Dummy data, will be replaced by Firestore
const schedule = [
  { startTime: '09:00', endTime: '09:45', lesson: '1-ლი გაკვეთილი' },
  { startTime: '10:00', endTime: '10:45', lesson: 'მე-2 გაკვეთილი' },
  { startTime: '11:00', endTime: '11:45', lesson: 'მე-3 გაკვეთილი' },
  { startTime: '12:00', endTime: '12:45', lesson: 'მე-4 გაკვეთილი' },
  { startTime: '13:30', endTime: '14:15', lesson: 'მე-5 გაკვეთილი' },
  { startTime: '14:30', endTime: '15:15', lesson: 'მე-6 გაკვეთილი' },
  { startTime: '15:30', endTime: '16:15', lesson: 'მე-7 გაკვეთილი' },
];

const announcements = [
    { id: 1, title: 'ტრენინგი AI-ზე', content: 'დღეს, 15:00 საათზე, აუდიტორიაში ჩატარდება ტრენინგი ხელოვნურ ინტელექტზე. დასწრება თავისუფალია.', imageId: 'ai-training' },
    { id: 2, title: 'სასკოლო კონცერტი', content: 'პარასკევს გაიმართება სასკოლო კონცერტი. ბილეთები შეგიძლიათ შეიძინოთ კანცელარიაში.', imageId: 'school-concert' },
];

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);


export default function MobilePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 font-body">
      <header className="text-center my-6">
        <h1 className="text-4xl font-bold font-headline text-primary">სკოლის დაფა</h1>
        <p className="text-muted-foreground mt-1">მობილური ვერსია</p>
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
              {schedule.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-base font-medium">{item.lesson}</span>
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
                    {announcements.map((ann, index) => {
                        const image = getImage(ann.imageId);
                        return (
                            <div key={ann.id}>
                                {index > 0 && <Separator className="my-6" />}
                                <div className="space-y-3">
                                    {image && (
                                        <div className="w-full overflow-hidden rounded-lg">
                                            <Image 
                                                src={image.imageUrl}
                                                alt={ann.title}
                                                width={600}
                                                height={400}
                                                className="object-cover w-full aspect-video"
                                                data-ai-hint={image.imageHint}
                                            />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-xl font-headline pt-2">{ann.title}</h3>
                                    <p className="text-base text-muted-foreground">{ann.content}</p>
                                </div>
                            </div>
                        )
                    })}
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
