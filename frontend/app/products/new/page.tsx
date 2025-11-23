'use client';

import ProductForm from '@/components/product/ProductForm';

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-16">
      <div className="max-w-4xl mx-auto px-4">
        <ProductForm />
      </div>
    </div>
  );
}
