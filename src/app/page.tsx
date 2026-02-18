import { SchoolSelector } from '@/components/school-selector';
import { School } from '@/lib/types';
import { Building } from 'lucide-react';

const schools: School[] = [
  { id: '1', name: '1-ლი საჯარო სკოლა', password: '1111' },
  { id: '7', name: 'მე-7 საჯარო სკოლა', password: '7777' },
  { id: '3', name: 'მე-3 საჯარო სკოლა', password: '3333' },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold text-primary flex items-center gap-4">
          <Building className="w-12 h-12" />
          სკოლის დაფა
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          აირჩიეთ თქვენი სკოლა გასაგრძელებლად
        </p>
      </div>
      <SchoolSelector schools={schools} />
    </main>
  );
}
