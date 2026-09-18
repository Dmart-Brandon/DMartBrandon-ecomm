import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dmartbrandon.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account',
          '/account/',
          '/checkout',
          '/checkout/',
          '/cart',
          '/orders',
          '/orders/',
          '/profile',
          '/profile/',
          '/sign-in',
          '/sign-up',
          '/sso-callback',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
