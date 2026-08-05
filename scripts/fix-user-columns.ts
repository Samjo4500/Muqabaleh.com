import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userRenames: Array<[string, string]> = [
  ['passwordhash', 'passwordHash'],
  ['interviewergender', 'interviewerGender'],
  ['accounttype', 'accountType'],
  ['companyid', 'companyId'],
  ['sessionsleft', 'sessionsLeft'],
  ['subscriptiontier', 'subscriptionTier'],
  ['subscriptionexpiresat', 'subscriptionExpiresAt'],
  ['isactive', 'isActive'],
  ['passwordresettoken', 'passwordResetToken'],
  ['passwordresetexpiry', 'passwordResetExpiry'],
  ['createdat', 'createdAt'],
  ['updatedat', 'updatedAt'],
];

const auditRenames: Array<[string, string]> = [
  ['actorid', 'actorId'],
  ['createdat', 'createdAt'],
];

async function rename(table: string, pairs: Array<[string, string]>) {
  for (const [from, to] of pairs) {
    const exists = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1 AND column_name=$2
      ) AS exists`,
      table,
      from,
    );
    if (!exists[0]?.exists) {
      console.log(`skip ${table}.${from}`);
      continue;
    }
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${table}" RENAME COLUMN "${from}" TO "${to}"`,
    );
    console.log(`renamed ${table}.${from} -> ${to}`);
  }
}

async function main() {
  await rename('User', userRenames);
  await rename('AuditLog', auditRenames);

  // Verify prisma can read the admin user
  const user = await prisma.user.findUnique({
    where: { email: 'samjo4500@gmail.com' },
  });
  console.log(
    'prisma_user',
    user
      ? {
          id: user.id,
          role: user.role,
          isActive: user.isActive,
          hasHash: !!user.passwordHash,
        }
      : null,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
