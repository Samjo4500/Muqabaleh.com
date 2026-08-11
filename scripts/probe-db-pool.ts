import { PrismaClient } from '@prisma/client';

function withParams(url: string, forceLimit1: boolean) {
  const u = new URL(url);
  if (forceLimit1) {
    u.searchParams.set('connection_limit', '1');
    u.searchParams.set('pool_timeout', '10');
  }
  if (
    u.hostname.includes('pooler.supabase.com') &&
    !u.searchParams.has('pgbouncer')
  ) {
    u.searchParams.set('pgbouncer', 'true');
  }
  if (!u.searchParams.has('connect_timeout')) {
    u.searchParams.set('connect_timeout', '10');
  }
  return u.toString().replace(/^https?:/, 'postgresql:');
}

async function run(label: string, url: string) {
  console.log('\n==', label, '==');
  console.log(
    'params',
    new URL(url.replace(/^postgresql:/, 'http:')).search,
  );
  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    const t0 = Date.now();
    await db.$queryRaw`SELECT 1`;
    console.log('select1 ok', Date.now() - t0, 'ms');
    try {
      const t1 = Date.now();
      await Promise.all([
        db.user.count(),
        db.b2BJob.count().catch(() => 0),
      ]);
      console.log('promise.all counts ok', Date.now() - t1, 'ms');
    } catch (e) {
      console.log(
        'promise.all FAIL',
        e instanceof Error ? e.message.slice(0, 220) : e,
      );
    }
    const t2 = Date.now();
    const users = await db.user.count();
    const jobs = await db.b2BJob.count().catch(() => 0);
    console.log('serial ok', { users, jobs, ms: Date.now() - t2 });
  } catch (e) {
    console.log(
      'TOP FAIL',
      e instanceof Error ? e.message.slice(0, 300) : e,
    );
  } finally {
    await db.$disconnect();
  }
}

async function main() {
  const base = process.env.DATABASE_URL;
  if (!base) throw new Error('DATABASE_URL missing');
  await run('as-is', base);
  await run('force connection_limit=1', withParams(base, true));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
