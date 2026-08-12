// ─── Rate Limiter (DB-backed, serverless-safe) ───────────────────
// Prefer Postgres ApiRateLimit so limits survive Vercel cold starts.
// Falls back to in-memory Map if the DB table is unavailable.

import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/security';

interface RateEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateEntry>();
const CLEANUP_MS = 5 * 60_000;
let lastCleanup = Date.now();

function cleanupMemory(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_MS) return;
  lastCleanup = now;
  for (const [key, entry] of memoryStore) {
    if (now > entry.resetAt) memoryStore.delete(key);
  }
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  cleanupMemory();
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

function memoryRemaining(key: string, limit: number): number {
  const entry = memoryStore.get(key);
  if (!entry || Date.now() > entry.resetAt) return limit;
  return Math.max(0, limit - entry.count);
}

function memoryResetAt(key: string): number {
  const entry = memoryStore.get(key);
  if (!entry) return 0;
  return Math.max(0, entry.resetAt - Date.now());
}

async function dbConsume(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number } | null> {
  try {
    const { db } = await import('@/lib/db');
    const now = new Date();
    const existing = await db.apiRateLimit.findUnique({ where: { key } });

    if (!existing || existing.resetAt.getTime() <= now.getTime()) {
      const resetAt = new Date(now.getTime() + windowMs);
      await db.apiRateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return {
        allowed: true,
        remaining: Math.max(0, limit - 1),
        resetAt: windowMs,
      };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: Math.max(0, existing.resetAt.getTime() - now.getTime()),
      };
    }

    const updated = await db.apiRateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return {
      allowed: true,
      remaining: Math.max(0, limit - updated.count),
      resetAt: Math.max(0, existing.resetAt.getTime() - now.getTime()),
    };
  } catch (err) {
    console.warn('[rate-limit] DB unavailable, using memory', err);
    return null;
  }
}

/**
 * Sync memory check (legacy callers). Prefer checkRateLimit / enforceIpRateLimit.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 15 * 60_000,
): boolean {
  return memoryRateLimit(key, limit, windowMs);
}

export function rateLimitRemaining(
  key: string,
  limit: number,
  _windowMs: number = 15 * 60_000,
): number {
  return memoryRemaining(key, limit);
}

export function rateLimitResetAt(key: string): number {
  return memoryResetAt(key);
}

export function checkRateLimit(
  ip: string,
  route: string,
  limit = 100,
  windowMs: number = 15 * 60_000,
) {
  const key = `${ip}:${route}`;
  // Sync path kept for legacy; async DB path used by enforceIpRateLimit.
  return {
    allowed: rateLimit(key, limit, windowMs),
    remaining: rateLimitRemaining(key, limit, windowMs),
    resetAt: rateLimitResetAt(key),
  };
}

export const RATE_LIMIT_MESSAGE =
  'Too many requests. Please try again in 60 seconds.';

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

/** Async DB-first rate limit result. */
export async function consumeRateLimit(
  ip: string,
  route: string,
  limit: number,
  windowMs: number = 60_000,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `${ip}:${route}`;
  const dbResult = await dbConsume(key, limit, windowMs);
  if (dbResult) return dbResult;
  const allowed = memoryRateLimit(key, limit, windowMs);
  return {
    allowed,
    remaining: memoryRemaining(key, limit),
    resetAt: memoryResetAt(key),
  };
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
  const rl = await consumeRateLimit(ip, route, limitPerMinute, 60_000);
  if (!rl.allowed) {
    const retryAfter = Math.max(1, Math.ceil(rl.resetAt / 1000));
    return tooManyRequestsResponse(retryAfter);
  }
  return null;
}
