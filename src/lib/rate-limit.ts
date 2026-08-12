// ─── In-Memory Rate Limiter ───────────────────────────────────────
// Sliding window per IP. No external dependency / KV required.
// Resets entries older than windowMs to prevent unbounded memory growth.
// Note: resets on serverless cold start — better than nothing for launch.

import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/security';

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

/** Clean up expired entries every 5 minutes */
const CLEANUP_MS = 5 * 60_000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Check if a request should be allowed.
 * @param key - Identifier (usually IP or IP+route)
 * @param limit - Max requests in the window
 * @param windowMs - Time window in ms (default 15 min)
 * @returns true if allowed, false if rate-limited
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 15 * 60_000,
): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/** Get remaining requests in the current window */
export function rateLimitRemaining(
  key: string,
  limit: number,
  windowMs: number = 15 * 60_000,
): number {
  const entry = store.get(key);
  if (!entry || Date.now() > entry.resetAt) return limit;
  return Math.max(0, limit - entry.count);
}

/** Time until the rate limit resets (ms) */
export function rateLimitResetAt(key: string): number {
  const entry = store.get(key);
  if (!entry) return 0;
  return Math.max(0, entry.resetAt - Date.now());
}

/**
 * Express/Next.js middleware helper.
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  ip: string,
  route: string,
  limit = 100,
  windowMs: number = 15 * 60_000,
) {
  const key = `${ip}:${route}`;
  return {
    allowed: rateLimit(key, limit, windowMs),
    remaining: rateLimitRemaining(key, limit, windowMs),
    resetAt: rateLimitResetAt(key),
  };
}

export const RATE_LIMIT_MESSAGE =
  'Too many requests. Please try again in 60 seconds.';

/** Standard 429 JSON for API abuse protection. */
export function tooManyRequestsResponse(retryAfterSec = 60): NextResponse {
  return NextResponse.json(
    { error: RATE_LIMIT_MESSAGE },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}

/**
 * Enforce a per-IP per-minute limit for the given route bucket.
 * Returns a 429 NextResponse when blocked, otherwise null.
 */
export async function enforceIpRateLimit(
  route: string,
  limitPerMinute: number,
): Promise<NextResponse | null> {
  const ip = await getClientIp();
  const rl = checkRateLimit(ip, route, limitPerMinute, 60_000);
  if (!rl.allowed) {
    const retryAfter = Math.max(1, Math.ceil(rl.resetAt / 1000));
    return tooManyRequestsResponse(retryAfter);
  }
  return null;
}
