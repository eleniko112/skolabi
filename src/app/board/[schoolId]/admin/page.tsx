"use client"; 

import { useParams } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { School } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPage() {
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId;
  const firestore = useFirestore();

  const schoolRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId);
  }, [firestore, schoolId]);

  const { data: schoolInfo, isLoading } = useDoc<School>(schoolRef);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!schoolInfo || !schoolId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>სკოლა არ მოიძებნა.</p>
        <Button asChild variant="outline">
          <Link href="/">მთავარზე დაბრუნება</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <AdminDashboard 
        schoolId={schoolId} 
        schoolName={schoolInfo.name} 
        adminPin={schoolInfo.adminPin || '0000'} 
      />
    </div>
  );
}
