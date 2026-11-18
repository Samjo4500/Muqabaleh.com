import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Connection handling depends on where the app runs, so it is decided from the
 * URL rather than an assumption about the host:
 *
 * - Supabase transaction pooler (PgBouncer, port 6543): needs pgbouncer=true
 *   (no prepared statements) and a small connection_limit.
 * - A long-lived server process (alwaysdata, a container, `next start`): the
 *   whole app shares ONE process, so a tiny pool is wrong — a single request
 *   can legitimately issue several queries at once. Give it a real pool.
 *
 * The previous version forced connection_limit=1 for every pooler URL, which
 * was correct on Vercel's per-isolate serverless model and is actively harmful
 * on a persistent server.
 */
export function resolveDatabaseUrl(rawUrl?: string): string | undefined {
  const raw = (rawUrl ?? process.env.DATABASE_URL)?.trim();
  if (!raw) return undefined;

  try {
    const u = new URL(raw);
    const isSupabasePooler = u.hostname.includes('pooler.supabase.com');
    const isTransactionPort = u.port === '6543';

    if (isSupabasePooler || isTransactionPort) {
      if (!u.searchParams.has('pgbouncer')) {
        u.searchParams.set('pgbouncer', 'true');
      }
      if (!u.searchParams.has('connection_limit')) {
        // PgBouncer multiplexes; the app only needs enough for its own
        // concurrency, and 10 is a sane ceiling for one server process.
        u.searchParams.set('connection_limit', '10');
      }
      if (!u.searchParams.has('pool_timeout')) {
        u.searchParams.set('pool_timeout', '20');
      }
    }

    if (!u.searchParams.has('connect_timeout')) {
      u.searchParams.set('connect_timeout', '10');
    }
    if (!u.searchParams.has('pool_timeout')) {
      // Fail fast instead of hanging health checks for ~10s+
      u.searchParams.set('pool_timeout', '20');
    }

    // URL() turns postgresql:// into http:// — restore scheme
    return u.toString().replace(/^https?:/, 'postgresql:');
  } catch {
    return raw;
  }
}

function createPrismaClient() {
  const url = resolveDatabaseUrl();
  return new PrismaClient({
    // A checkout grant is one interactive transaction: Payment + entitlement +
    // order state. The default 5s ceiling is fine on a healthy server, but a
    // slow grant must not roll back after the money moved.
    transactionOptions: { timeout: 15_000, maxWait: 10_000 },
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
    ...(url
      ? {
          datasources: {
            db: { url },
          },
        }
      : {}),
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// One client per process. On a persistent server this is a single long-lived
// pool; on serverless it keeps a warm isolate from opening new connections.
globalForPrisma.prisma = db;

/** Alias used by some console/service modules */
export const prisma = db;
