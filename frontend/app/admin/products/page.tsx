'use client';

import { useSearchParams } from 'next/navigation';
import AdminProductList from '@/components/admin/AdminProductList';
import type { ProductStatus } from '@/types';

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const initialStatus =
    statusParam === 'FOR_SALE' || statusParam === 'SOLD' || statusParam === 'DELETED'
      ? (statusParam as ProductStatus)
      : '';

  return <AdminProductList initialStatus={initialStatus} />;
}
