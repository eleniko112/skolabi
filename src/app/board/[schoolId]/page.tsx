// This page will be built out to show the full board.
// For now, it's a placeholder to confirm routing works.
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InfoBoard } from '@/components/board/info-board';
import { ScheduleTimer } from '@/components/board/schedule-timer';
import { QRCodeDisplay } from '@/components/board/qr-code-display';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Settings } from 'lucide-react';

// Dummy data, will be replaced by Firestore
const schoolData = {
  '1': { name: '1-ლი საჯარო სკოლა', logoId: 'school-logo-1' },
  '7': { name: 'მე-7 საჯარო სკოლა', logoId: 'school-logo-7' },
  '3': { name: 'მე-3 საჯარო სკოლა', logoId: 'school-logo-3' },
};

const getLogo = (id: string) => {
    const logoId = schoolData[id as keyof typeof schoolData]?.logoId;
    return PlaceHolderImages.find(img => img.id === logoId) || PlaceHolderImages.find(img => img.id === 'school-logo-1');
}

export default function BoardPage({ params }: { params: { schoolId: string } }) {
  const schoolInfo = schoolData[params.schoolId as keyof typeof schoolData] || { name: 'უცნობი სკოლა' };
  const logo = getLogo(params.schoolId);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          {logo && (
            <Image
              src={logo.imageUrl}
              alt={`${schoolInfo.name} Logo`}
              width={50}
              height={50}
              className="rounded-full"
              data-ai-hint={logo.imageHint}
            />
          )}
          <h1 className="text-2xl font-bold font-headline text-primary">{schoolInfo.name} - დაფა</h1>
        </div>
        <Button asChild variant="ghost" size="icon">
          <Link href={`/board/${params.schoolId}/admin`}>
            <Settings className="h-6 w-6" />
            <span className="sr-only">ადმინის პანელი</span>
          </Link>
        </Button>
      </header>
      
      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <ScheduleTimer schoolId={params.schoolId} />
        </div>
        <div className="w-full md:w-2/3 lg:w-3/4">
          <InfoBoard schoolId={params.schoolId} />
        </div>
      </main>
      
      <footer className="p-4">
        <QRCodeDisplay />
      </footer>
    </div>
  );
}
