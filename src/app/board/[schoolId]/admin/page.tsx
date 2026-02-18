// This page will contain the admin panel for a specific school.
// It will be protected by a PIN.
// For now, it's a simple placeholder.

import { AdminDashboard } from '@/components/admin/admin-dashboard';

const schoolData = {
  '1': { name: '1-ლი საჯარო სკოლა', adminPin: '1234' },
  '7': { name: 'მე-7 საჯარო სკოლა', adminPin: '1234' },
  '3': { name: 'მე-3 საჯარო სკოლა', adminPin: '1234' },
};

export default function AdminPage({ params }: { params: { schoolId: string } }) {
  const schoolInfo = schoolData[params.schoolId as keyof typeof schoolData] || { name: 'უცნობი სკოლა', adminPin: '0000' };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <AdminDashboard schoolId={params.schoolId} schoolName={schoolInfo.name} adminPin={schoolInfo.adminPin} />
    </div>
  );
}
