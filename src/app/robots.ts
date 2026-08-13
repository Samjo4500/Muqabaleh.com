import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

const DISALLOW = [
  '/admin',
  '/api',
  '/app',
  '/b2b',
  '/console',
  '/partner',
  '/portal',
  '/interviewer/dashboard',
  '/interviewer/availability',
  '/interviewer/earnings',
  '/interviewer/bookings',
  '/interviewer/profile',
  '/interview/prequal',
  '/interview/prep',
  '/interview/session',
  '/interview/summary',
  '/interview/report',
  '/auth/',
  '/en/admin',
  '/en/api',
  '/en/app',
  '/en/b2b',
  '/en/console',
  '/en/partner',
  '/en/portal',
  '/en/interview/prequal',
  '/en/interview/prep',
  '/en/interview/session',
  '/en/interview/summary',
  '/en/interview/report',
  '/en/auth/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: 'Googlebot', allow: '/', disallow: DISALLOW },
      { userAgent: 'Bingbot', allow: '/', disallow: DISALLOW },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap-interview-guides.xml`,
    ],
    host: SITE_URL,
  };
}
