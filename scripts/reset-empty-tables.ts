import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const KEEP = new Set(['User', 'AuditLog', '_prisma_migrations']);

async function main() {
  const tables = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`,
  );

  // Drop dependent empty tables first with CASCADE for non-kept
  for (const t of tables) {
    if (KEEP.has(t.tablename)) {
      console.log('KEEP', t.tablename);
      continue;
    }
    const count = await prisma.$queryRawUnsafe<Array<{ c: bigint }>>(
      `SELECT COUNT(*)::bigint AS c FROM "${t.tablename}"`,
    );
    const n = Number(count[0].c);
    if (n > 0) {
      console.log('SKIP non-empty', t.tablename, n);
      continue;
    }
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${t.tablename}" CASCADE`);
    console.log('DROPPED', t.tablename);
  }
}
main().catch(e=>{console.error(e); process.exitCode=1}).finally(()=>prisma.$disconnect());
