'use client';

import { useParams } from 'next/navigation';
import AdminProductDashboard from '@/components/admin/AdminProductDashboard';

export default function AdminProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  return <AdminProductDashboard productId={productId} />;
}
