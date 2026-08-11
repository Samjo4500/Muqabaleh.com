import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/**
 * Content-Security-Policy tuned for:
 * - Next.js App Router (inline scripts/styles in production without nonce middleware)
 * - PayPal JS SDK + checkout iframes/popups
 * - Daily.co call iframes (human interview rooms)
 * - Microphone / blob media for AI interview recording
 * - Vercel Web Analytics
 *
 * Prefer tightening further with nonces later; do not invent allowlists for unused CDNs.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
  // Next.js hydration + PayPal SDK. 'unsafe-eval' kept for Next/PayPal compatibility;
  // remove once a nonce-based CSP middleware is in place.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://c.paypal.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "connect-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://c.paypal.com https://api.daily.co https://*.daily.co wss://*.daily.co https://vitals.vercel-analytics.com",
  "frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://*.daily.co",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=(), payment=(self "https://www.paypal.com" "https://www.sandbox.paypal.com")',
  },
  // Allow PayPal checkout popups without fully isolating the opener.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns'],
  },
  async redirects() {
    return [
      { source: '/login', destination: '/auth/signin', permanent: false },
      { source: '/register', destination: '/auth/register', permanent: false },
      { source: '/en/login', destination: '/en/auth/signin', permanent: false },
      { source: '/en/register', destination: '/en/auth/register', permanent: false },
    ];
  },
  async headers() {
    const noIndex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/og-image.(jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      { source: '/app/:path*', headers: noIndex },
      { source: '/en/app/:path*', headers: noIndex },
      { source: '/auth/:path*', headers: noIndex },
      { source: '/en/auth/:path*', headers: noIndex },
      { source: '/admin/:path*', headers: noIndex },
      { source: '/en/admin/:path*', headers: noIndex },
      { source: '/b2b/:path*', headers: noIndex },
      { source: '/en/b2b/:path*', headers: noIndex },
    ];
  },
};

export default withNextIntl(nextConfig);
