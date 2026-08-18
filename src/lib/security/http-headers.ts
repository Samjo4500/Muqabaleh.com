/**
 * Shared security headers for next.config.
 * Do not add COEP / credentialless CORP — those break PayPal + Daily iframes.
 */

export const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
  // Next.js hydration + PayPal SDK. 'unsafe-eval' kept for Next/PayPal compatibility;
  // remove once a nonce-based CSP middleware is in place.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://c.paypal.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "connect-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://c.paypal.com https://api.daily.co https://*.daily.co wss://*.daily.co https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.sentry.io https://*.ingest.sentry.io https://www.facebook.com https://connect.facebook.net",
  "frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://*.daily.co",
  "upgrade-insecure-requests",
].join('; ');

export const securityHeaders: Array<{ key: string; value: string }> = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(self), microphone=(self), geolocation=(), payment=(self "https://www.paypal.com" "https://www.sandbox.paypal.com")',
  },
  // Allow PayPal checkout popups without fully isolating the opener.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
];
