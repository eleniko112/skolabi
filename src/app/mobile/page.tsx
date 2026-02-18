import { Bell, Megaphone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Dummy data, will be replaced by Firestore
const schedule = [
  { time: '09:00 - 09:45', lesson: '1-ლი გაკვეთილი: მათემატიკა' },
  { time: '10:00 - 10:45', lesson: 'მე-2 გაკვეთილი: ქართული' },
  { time: '11:00 - 11:45', lesson: 'მე-3 გაკვეთილი: ინგლისური' },
  { time: '12:00 - 12:30', lesson: 'დიდი დასვენება' },
  { time: '12:30 - 13:15', lesson: 'მე-4 გაკვეთილი: ისტორია' },
];

const announcements = [
    { id: 1, title: 'ტრენინგი AI-ზე', content: 'დღეს, 15:00 საათზე, აუდიტორიაში ჩატარდება ტრენინგი ხელოვნურ ინტელექტზე. დასწრება თავისუფალია.', imageId: 'ai-training' },
    { id: 2, title: 'სასკოლო კონცერტი', content: 'პარასკევს გაიმართება სასკოლო კონცერტი. ბილეთები შეგიძლიათ შეიძინოთ კანცელარიაში.', imageId: 'school-concert' },
];

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);


export default function MobilePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold font-headline text-primary">SchoolSync Board</h1>
        <p className="text-muted-foreground">მობილური ვერსია</p>
      </header>

      <main className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="h-5 w-5" />
              დღის განრიგი
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {schedule.map((item, index) => (
                <li key={index} className="flex items-center gap-4">
                  <Badge variant="secondary">{item.time}</Badge>
                  <span className="text-sm">{item.lesson}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Megaphone className="h-5 w-5" />
                    აქტიური განცხადებები
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {announcements.map((ann, index) => {
                        const image = getImage(ann.imageId);
                        return (
                            <div key={ann.id}>
                                {index > 0 && <Separator className="my-4" />}
                                <div className="space-y-2">
                                    {image && (
                                        <Image 
                                            src={image.imageUrl}
                                            alt={ann.title}
                                            width={600}
                                            height={400}
                                            className="rounded-lg object-cover w-full aspect-video"
                                            data-ai-hint={image.imageHint}
                                        />
                                    )}
                                    <h3 className="font-bold text-lg font-headline">{ann.title}</h3>
                                    <p className="text-sm text-muted-foreground">{ann.content}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>

      </main>

      <footer className="text-center mt-8 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SchoolSync Board. ყველა უფლება დაცულია.</p>
      </footer>
    </div>
  );
}
