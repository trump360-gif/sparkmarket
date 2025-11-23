'use client';

import { useParams } from 'next/navigation';
import AdminUserDashboard from '@/components/admin/AdminUserDashboard';

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  return <AdminUserDashboard userId={userId} />;
}
