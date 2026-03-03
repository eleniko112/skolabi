"use client"; 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getSchoolById } from '@/lib/schools';
import { School } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId;
  const [schoolInfo, setSchoolInfo] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (schoolId) {
      const foundSchool = getSchoolById(schoolId);
      setSchoolInfo(foundSchool);
      setIsLoading(false);
    }
  }, [schoolId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!schoolInfo) {
    return <div className="flex min-h-screen items-center justify-center"><p>სკოლა არ მოიძებნა.</p></div>;
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
