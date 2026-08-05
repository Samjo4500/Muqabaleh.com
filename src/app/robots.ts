import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

const DISALLOW = [
  '/admin',
  '/api',
  '/app',
  '/b2b',
  '/partner',
  '/interviewer/dashboard',
  '/interviewer/availability',
  '/interviewer/earnings',
  '/interviewer/bookings',
  '/interviewer/profile',
  '/auth/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: 'Googlebot', allow: '/', disallow: DISALLOW },
      { userAgent: 'Bingbot', allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
