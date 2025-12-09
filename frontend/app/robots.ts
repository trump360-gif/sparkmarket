import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sparkmarket.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/settings',
          '/products/new',
          '/products/*/edit',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
