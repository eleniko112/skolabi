"use client"; 

import { useParams } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { School } from '@/lib/types';
import { Loader2 } from 'lucide-react';


export default function AdminPage() {
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId;
  const firestore = useFirestore();

  const schoolDocRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, 'schools', schoolId);
  }, [firestore, schoolId]);

  const { data: schoolInfo, isLoading } = useDoc<School>(schoolDocRef);


  if (isLoading || !schoolId) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (schoolInfo === null) {
      return <div className="flex min-h-screen items-center justify-center"><p>School not found.</p></div>;
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
