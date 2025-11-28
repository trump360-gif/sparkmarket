'use client';

import ProductForm from '@/components/product/ProductForm';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-10">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 right-0 h-60 overflow-hidden pointer-events-none">
        <div className="absolute top-5 left-1/4 w-48 h-48 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center text-slate-600 hover:text-primary-600 transition-colors group animate-fade-in text-sm"
        >
          <span className="w-7 h-7 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mr-1.5 group-hover:bg-primary-50 group-hover:border-primary-200 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          <span className="font-medium">돌아가기</span>
        </button>

        <div className="animate-slide-up">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
