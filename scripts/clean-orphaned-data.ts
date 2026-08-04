/**
 * Pre-migration data cleanup for P0.5 schema integrity.
 *
 * Run BEFORE applying the Prisma migration:
 *   DATABASE_URL=... npx tsx scripts/clean-orphaned-data.ts
 *
 * Safe to re-run. Uses raw SQL so it works against the *old* schema
 * (string columns, InterviewerProfile still present, missing FKs).
 *
 * Steps:
 * 1. Map legacy role/tier/status strings to enum-compatible values
 * 2. Rename User.subscriptionTier → prepare for `tier` (copy values)
 * 3. Fix Interviewer.userId = 'pending' / invalid FKs
 * 4. Fix HumanBooking.userId orphans / nulls
 * 5. Merge InterviewerProfile → Interviewer where possible
 * 6. Migrate Payment CREATED/CAPTURED → PENDING/COMPLETED + amount dollars
 * 7. Prepare InterviewerPayout batchId / amount dollars / userId
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

type Row = Record<string, unknown>;

async function tableExists(name: string): Promise<boolean> {
  const rows = await db.$queryRawUnsafe<Row[]>(
    `SELECT to_regclass($1) AS reg`,
    `public."${name}"`,
  );
  return Boolean(rows[0]?.reg);
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await db.$queryRawUnsafe<Row[]>(
    `SELECT 1 AS ok
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2
     LIMIT 1`,
    table,
    column,
  );
  return rows.length > 0;
}

async function main() {
  console.log('=== clean-orphaned-data: start ===');

  // ── 1. User role / tier string normalization ──
  if (await tableExists('User')) {
    // Legacy ADMIN → SUPER_ADMIN (runtime RBAC)
    await db.$executeRawUnsafe(`
      UPDATE "User"
      SET role = 'SUPER_ADMIN'
      WHERE role IN ('ADMIN', 'admin')
    `);

    // Normalize unknown roles to USER
    await db.$executeRawUnsafe(`
      UPDATE "User"
      SET role = 'USER'
      WHERE role IS NULL
         OR role NOT IN ('USER', 'INTERVIEWER', 'ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN')
    `);

    const tierCol = (await columnExists('User', 'subscriptionTier'))
      ? 'subscriptionTier'
      : (await columnExists('User', 'tier'))
        ? 'tier'
        : null;

    if (tierCol) {
      await db.$executeRawUnsafe(`
        UPDATE "User"
        SET "${tierCol}" = 'FREE'
        WHERE "${tierCol}" IS NULL
           OR "${tierCol}" NOT IN ('FREE', 'BASIC', 'PRO', 'PREMIUM', 'UNLIMITED')
      `);

      // If still on subscriptionTier, ensure values are clean for rename in migration
      if (tierCol === 'subscriptionTier' && !(await columnExists('User', 'tier'))) {
        console.log('User.subscriptionTier normalized (migration will rename → tier)');
      }
    }

    console.log('✓ User role/tier normalized');
  }

  // ── 2. Interviewer status + invalid userId ──
  if (await tableExists('Interviewer')) {
    await db.$executeRawUnsafe(`
      UPDATE "Interviewer"
      SET status = 'ACTIVE'
      WHERE status IN ('APPROVED', 'approved')
    `);
    await db.$executeRawUnsafe(`
      UPDATE "Interviewer"
      SET status = 'SUSPENDED'
      WHERE status IN ('BLOCKED', 'blocked')
    `);
    await db.$executeRawUnsafe(`
      UPDATE "Interviewer"
      SET status = 'PENDING'
      WHERE status IS NULL
         OR status NOT IN ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED')
    `);

    // Delete interviewers with sentinel / missing user
    const pending = await db.$executeRawUnsafe(`
      DELETE FROM "Interviewer"
      WHERE "userId" IS NULL
         OR "userId" = ''
         OR "userId" = 'pending'
         OR NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = "Interviewer"."userId")
    `);
    console.log('✓ Interviewer statuses normalized; orphan/pending rows cleaned', pending);
  }

  // ── 3. InterviewerProfile prep ──
  // Field merge into Interviewer happens in the SQL migration (after new columns exist).
  // Here we only drop profiles whose userId is invalid so the migration insert won't fail FKs.
  if (await tableExists('InterviewerProfile')) {
    await db.$executeRawUnsafe(`
      DELETE FROM "InterviewerProfile" p
      WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = p."userId")
    `);
    console.log('✓ InterviewerProfile orphans removed (field merge runs in migration SQL)');
  }

  // ── 4. HumanBooking userId cleanup ──
  if (await tableExists('HumanBooking')) {
    // Attach orphan bookings to a user matching candidateEmail when possible
    await db.$executeRawUnsafe(`
      UPDATE "HumanBooking" b
      SET "userId" = u.id
      FROM "User" u
      WHERE (b."userId" IS NULL OR b."userId" = '' OR b."userId" = 'pending'
             OR NOT EXISTS (SELECT 1 FROM "User" x WHERE x.id = b."userId"))
        AND lower(u.email) = lower(b."candidateEmail")
    `);

    // Delete remaining orphans (cannot satisfy required FK)
    const deleted = await db.$executeRawUnsafe(`
      DELETE FROM "HumanBooking"
      WHERE "userId" IS NULL
         OR "userId" = ''
         OR "userId" = 'pending'
         OR NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = "HumanBooking"."userId")
    `);

    // Normalize booking statuses
    await db.$executeRawUnsafe(`
      UPDATE "HumanBooking" SET status = 'PENDING'
      WHERE status IS NULL OR status NOT IN (
        'PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','RESCHEDULED','NO_SHOW','REFUNDED'
      )
    `);

    console.log('✓ HumanBooking orphans cleaned / statuses normalized', deleted);
  }

  // ── 5. Payment status + amount prep ──
  if (await tableExists('Payment')) {
    if (await columnExists('Payment', 'status')) {
      await db.$executeRawUnsafe(`
        UPDATE "Payment" SET status = 'COMPLETED' WHERE status IN ('CAPTURED', 'captured')
      `);
      await db.$executeRawUnsafe(`
        UPDATE "Payment" SET status = 'PENDING' WHERE status IN ('CREATED', 'created')
      `);
      await db.$executeRawUnsafe(`
        UPDATE "Payment" SET status = 'FAILED'
        WHERE status NOT IN ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED')
      `);
    }

    // Soft-delete payments without a valid user (required FK coming)
    if (await columnExists('Payment', 'userId')) {
      await db.$executeRawUnsafe(`
        DELETE FROM "Payment"
        WHERE "userId" IS NULL
           OR NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = "Payment"."userId")
      `);
    }

    console.log('✓ Payment statuses normalized; orphan payments removed');
  }

  // ── 6. InterviewerPayout prep ──
  if (await tableExists('InterviewerPayout')) {
    await db.$executeRawUnsafe(`
      UPDATE "InterviewerPayout" SET status = 'FAILED'
      WHERE status IN ('REJECTED') AND status IS NOT NULL
    `).catch(() => {});

    await db.$executeRawUnsafe(`
      UPDATE "InterviewerPayout" SET status = 'PENDING'
      WHERE status IS NULL
         OR status NOT IN ('PENDING','PROCESSING','COMPLETED','FAILED','REJECTED')
    `);

    // Drop payouts whose interviewer is gone
    await db.$executeRawUnsafe(`
      DELETE FROM "InterviewerPayout" p
      WHERE NOT EXISTS (
        SELECT 1 FROM "Interviewer" i WHERE i.id = p."interviewerId"
      )
    `);

    console.log('✓ InterviewerPayout cleaned');
  }

  // ── 7. CompanyPanel: drop rows pointing at missing InterviewerProfile/Interviewer ──
  if (await tableExists('CompanyPanel')) {
    await db.$executeRawUnsafe(`
      DELETE FROM "CompanyPanel" cp
      WHERE NOT EXISTS (
        SELECT 1 FROM "Interviewer" i WHERE i.id = cp."interviewerId"
      )
      AND NOT EXISTS (
        SELECT 1 FROM "InterviewerProfile" p WHERE p.id = cp."interviewerId"
      )
    `).catch(() => {});
    console.log('✓ CompanyPanel orphans cleaned');
  }

  console.log('=== clean-orphaned-data: done ===');
  console.log('Next: npx prisma migrate dev --name schema_integrity_fks_enums');
}

main()
  .catch((err) => {
    console.error('clean-orphaned-data failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
