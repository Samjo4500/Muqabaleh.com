/**
 * Reset SUPER_ADMIN password (local / ops use).
 *
 *   DATABASE_URL=... ADMIN_EMAIL=sam@muqabaleh.com ADMIN_TEMP_PASSWORD='...' \
 *     npx tsx scripts/reset-admin-password.ts
 */
import { randomBytes } from 'crypto';
import { hashSync } from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'sam@muqabaleh.com').trim().toLowerCase();
  const tempPassword =
    process.env.ADMIN_TEMP_PASSWORD || randomBytes(18).toString('base64url') + '!A1';

  const passwordHash = hashSync(tempPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      totpEnabled: false,
      totpSecret: null,
      tier: 'UNLIMITED',
      sessionsLeft: 999,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Sam',
      role: UserRole.SUPER_ADMIN,
      accountType: 'INDIVIDUAL',
      language: 'AR',
      interviewerGender: 'MALE',
      sessionsLeft: 999,
      tier: 'UNLIMITED',
      isActive: true,
    },
  });

  console.log('Reset SUPER_ADMIN:', user.id, user.email);
  console.log('ADMIN_TEMP_PASSWORD=' + tempPassword);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
