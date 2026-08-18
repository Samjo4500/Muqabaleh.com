import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { securityHeaders } from './src/lib/security/http-headers';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1400],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  compress: true,
  poweredByHeader: false,
  // Do not wipe .next/cache — Vercel persists it between builds.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns'],
    // Only ~30 guide pages prerender now — higher concurrency is safe.
    staticGenerationMaxConcurrency: 8,
    staticGenerationRetryCount: 2,
  },
  // Guides no longer enumerate the full catalog at build.
  staticPageGenerationTimeout: 60,
  async redirects() {
    return [
      { source: '/login', destination: '/auth/signin', permanent: false },
      { source: '/register', destination: '/auth/register', permanent: false },
      { source: '/en/login', destination: '/en/auth/signin', permanent: false },
      { source: '/en/register', destination: '/en/auth/register', permanent: false },
      { source: '/help', destination: '/support', permanent: false },
      { source: '/en/help', destination: '/en/support', permanent: false },
      { source: '/dashboard', destination: '/app', permanent: false },
      { source: '/en/dashboard', destination: '/en/app', permanent: false },
      {
        source: '/contact-sales',
        destination: '/employers#enterprise-form',
        permanent: false,
      },
      {
        source: '/en/contact-sales',
        destination: '/en/employers#enterprise-form',
        permanent: false,
      },
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
        // View-only company profile: open inline and allow same-origin embed.
        source: '/muqabaleh-company-profile.pdf',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'inline; filename="Muqabaleh-Company-Profile.pdf"',
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; frame-ancestors 'self'; object-src 'none'; base-uri 'none'",
          },
        ],
      },
      {
        source: '/.well-known/security.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
        ],
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
      { source: '/console/:path*', headers: noIndex },
      { source: '/en/console/:path*', headers: noIndex },
      { source: '/partner/:path*', headers: noIndex },
      { source: '/en/partner/:path*', headers: noIndex },
      { source: '/portal/:path*', headers: noIndex },
      { source: '/en/portal/:path*', headers: noIndex },
      { source: '/interviewer/dashboard/:path*', headers: noIndex },
      { source: '/en/interviewer/dashboard/:path*', headers: noIndex },
    ];
  },
};

export default withNextIntl(nextConfig);
