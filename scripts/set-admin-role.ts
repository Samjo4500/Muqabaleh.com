/**
 * One-off ops script: ensure admin user exists with SUPER_ADMIN role.
 *
 * Usage:
 *   DATABASE_URL=... ADMIN_EMAIL=sam@muqabaleh.com bunx tsx scripts/set-admin-role.ts
 */
import { createHash, randomBytes } from 'crypto';
import { hashSync } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cuidLike(): string {
  return (
    'c' +
    Date.now().toString(36) +
    createHash('sha256').update(randomBytes(16)).digest('hex').slice(0, 16)
  );
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'sam@muqabaleh.com').trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true, email: true, role: true },
  });

  if (existing) {
    const user = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'SUPER_ADMIN', isActive: true, tier: 'UNLIMITED', sessionsLeft: 999 },
    });
    console.log('Updated user:', user.id, 'Role:', user.role);
    return;
  }

  const tempPassword =
    process.env.ADMIN_TEMP_PASSWORD || randomBytes(18).toString('base64url');
  const passwordHash = hashSync(tempPassword, 12);

  const user = await prisma.user.create({
    data: {
      id: cuidLike(),
      email: adminEmail,
      passwordHash,
      name: 'Sam',
      role: 'SUPER_ADMIN',
      accountType: 'INDIVIDUAL',
      language: 'AR',
      interviewerGender: 'MALE',
      sessionsLeft: 999,
      tier: 'UNLIMITED',
      isActive: true,
    },
  });

  console.log('Created user:', user.id, 'Role:', user.role);
  console.log('ADMIN_TEMP_PASSWORD=' + tempPassword);
  console.log('IMPORTANT: Change this password immediately after first login.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
