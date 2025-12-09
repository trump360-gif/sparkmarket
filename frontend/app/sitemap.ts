import { MetadataRoute } from 'next';

// ================================
// Types
// ================================

interface Product {
  id: string;
  updated_at: string;
}

interface PaginatedResponse {
  data: Product[];
  meta: {
    total: number;
  };
}

// ================================
// Data Fetching
// ================================

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/products?status=FOR_SALE&limit=1000`,
      {
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return [];
    }

    const data: PaginatedResponse = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
    return [];
  }
}

// ================================
// Sitemap Generation
// ================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sparkmarket.vercel.app';

  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 상품 페이지들
  const products = await getProducts();
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
