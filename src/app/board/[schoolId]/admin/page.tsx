"use client"; 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getSchoolById } from '@/lib/schools';
import { School } from '@/lib/types';

export default function AdminPage() {
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId;
  const [schoolInfo, setSchoolInfo] = useState<School | null>(null);

  useEffect(() => {
    if (schoolId) {
      const foundSchool = getSchoolById(schoolId);
      setSchoolInfo(foundSchool);
    }
  }, [schoolId]);

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
