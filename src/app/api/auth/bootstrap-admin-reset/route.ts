import { NextRequest, NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import { db } from '@/lib/db';
import { isAdminPassword } from '@/lib/security';
import { requireConfiguredSecret, secretsMatch } from '@/lib/security-tokens';

/**
 * One-shot Super Admin password reset when email reset is unavailable.
 * Requires ADMIN_BOOTSTRAP_SECRET (min 24 chars). Remove that env var after use.
 */
export async function POST(req: NextRequest) {
  const bootstrap = requireConfiguredSecret(
    process.env.ADMIN_BOOTSTRAP_SECRET,
    24,
  );
  if (!bootstrap) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const secret = String(body.secret || req.headers.get('x-bootstrap-secret') || '');
    const email = String(body.email || process.env.ADMIN_EMAIL || '')
      .trim()
      .toLowerCase();
    const newPassword = String(body.newPassword || '');

    if (!secretsMatch(secret, bootstrap)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const policy = isAdminPassword(newPassword);
    if (!policy.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet admin policy',
          details: policy.errors,
          hint: 'Min 12 chars, letter + number + special character',
        },
        { status: 400 },
      );
    }

    // Ensure optional security columns exist (safe if already applied)
    const alters = [
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totpSecret" TEXT',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totpEnabled" BOOLEAN NOT NULL DEFAULT false',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3)',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3)',
    ];
    for (const sql of alters) {
      try {
        await db.$executeRawUnsafe(sql);
      } catch {
        // ignore — older PG / permission edge cases
      }
    }

    const existing = await db.$queryRawUnsafe<Array<{ id: string; email: string }>>(
      'SELECT id, email FROM "User" WHERE lower(email) = $1 LIMIT 1',
      email,
    );
    if (!existing.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const passwordHash = hashSync(newPassword, 12);
    await db.$executeRawUnsafe(
      `UPDATE "User"
       SET "passwordHash" = $1,
           role = 'SUPER_ADMIN',
           "isActive" = true,
           "failedLoginAttempts" = 0,
           "lockedUntil" = NULL,
           "totpEnabled" = false,
           "totpSecret" = NULL,
           "passwordResetToken" = NULL,
           "passwordResetExpiry" = NULL,
           "updatedAt" = NOW()
       WHERE id = $2`,
      passwordHash,
      existing[0].id,
    );

    return NextResponse.json({
      ok: true,
      email: existing[0].email,
      role: 'SUPER_ADMIN',
      message: 'Password reset. Sign in, then remove ADMIN_BOOTSTRAP_SECRET from Vercel.',
    });
  } catch (err) {
    console.error('[bootstrap-admin-reset]', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
