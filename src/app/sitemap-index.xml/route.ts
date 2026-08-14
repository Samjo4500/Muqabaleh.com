const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

/**
 * Sitemap index for GSC. Only includes child sitemaps that exist in production.
 * Keep in sync with public/sitemap-index.xml (static fallback).
 */
export function GET() {
  const children = [
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/sitemap-jobs.xml`,
    `${SITE_URL}/sitemap-interview-guides.xml`,
  ];

  const body = children
    .map(
      (loc) =>
        `  <sitemap>\n    <loc>${loc}</loc>\n  </sitemap>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
