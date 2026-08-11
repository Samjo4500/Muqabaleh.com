import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Supabase pooler (PgBouncer) + Vercel serverless:
 * - Use a single PrismaClient per isolate (globalThis in prod too)
 * - Prefer connection_limit=1 so each function holds one pooled connection
 * - pgbouncer=true disables prepared statements (required for transaction pooler)
 */
function resolveDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
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
        u.searchParams.set('connection_limit', '1');
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

// Cache on globalThis in all environments (critical for Vercel warm isolates)
globalForPrisma.prisma = db;

/** Alias used by some console/service modules */
export const prisma = db;
