import { createHash } from 'crypto';

/** Daily-rotating IP hash — not reversible to raw IP, still useful for uniqueness. */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_IP_SALT || process.env.NEXTAUTH_SECRET || 'muqabaleh-analytics';
  return createHash('sha256').update(`${salt}:${day}:${ip}`).digest('hex').slice(0, 32);
}

export function clientIpFromHeaders(headers: Headers): string | null {
  const xf = headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim() || null;
  return headers.get('x-real-ip')?.trim() || null;
}

export function geoFromHeaders(headers: Headers): {
  country: string | null;
  region: string | null;
  city: string | null;
} {
  return {
    country: headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || null,
    region: headers.get('x-vercel-ip-country-region') || null,
    city: headers.get('x-vercel-ip-city') || null,
  };
}
