"use client"; // Make it a client component

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getSchoolById } from '@/lib/schools';
import { School } from '@/lib/types';
import { Loader2 } from 'lucide-react';


export default function AdminPage() {
  const params = useParams<{ schoolId: string }>();
  const schoolId = params.schoolId;

  const [schoolInfo, setSchoolInfo] = useState<School | null | undefined>(undefined);

  useEffect(() => {
    if (!schoolId) return;
    const school = getSchoolById(schoolId);
    setSchoolInfo(school);

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'schools-data') {
           const updatedSchool = getSchoolById(schoolId);
           setSchoolInfo(updatedSchool);
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [schoolId]);

  if (schoolInfo === undefined || !schoolId) {
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
