import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';

// ================================
// Types
// ================================

interface PageProps {
  params: Promise<{ id: string }>;
}

// ================================
// Data Fetching
// ================================

async function getProduct(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products/${id}`,
      {
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

// ================================
// Metadata Generation
// ================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: '상품을 찾을 수 없습니다',
      description: '요청하신 상품이 존재하지 않거나 삭제되었습니다.',
    };
  }

  const price = product.price.toLocaleString();
  const imageUrl = product.images?.[0]?.url || '/og-image.png';
  const description = product.description?.slice(0, 150) || `${product.title} - ${price}원`;

  return {
    title: product.title,
    description: `${description} | ${price}원`,
    openGraph: {
      title: product.title,
      description: `${price}원 - ${product.category}`,
      type: 'website',
      locale: 'ko_KR',
      siteName: '스파크마켓',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: `${price}원 - ${product.category}`,
      images: [imageUrl],
    },
  };
}

// ================================
// Page Component
// ================================

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductPageClient productId={id} />;
}
