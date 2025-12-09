import { Metadata } from 'next';
import CategoriesPageClient from './CategoriesPageClient';

// ================================
// Metadata
// ================================

export const metadata: Metadata = {
  title: '카테고리',
  description: '스파크마켓의 다양한 중고 상품 카테고리를 둘러보세요. 디지털/가전, 패션의류, 패션잡화, 뷰티/미용, 스포츠/레저, 도서 등 다양한 카테고리에서 원하는 상품을 찾아보세요.',
  openGraph: {
    title: '카테고리 | 스파크마켓',
    description: '다양한 중고 상품 카테고리를 둘러보세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '스파크마켓',
  },
};

// ================================
// Page Component
// ================================

export default function CategoriesPage() {
  return <CategoriesPageClient />;
}
