import { NextRequest, NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { db } from '@/lib/db';
import { isAdminPassword } from '@/lib/security';

/**
 * One-shot Super Admin password reset when email reset is unavailable.
 * Requires ADMIN_BOOTSTRAP_SECRET to be set in the environment.
 * Remove that env var after use — endpoint becomes a hard 404/403.
 */
export async function POST(req: NextRequest) {
  const bootstrap = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!bootstrap) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const secret = String(body.secret || req.headers.get('x-bootstrap-secret') || '');
  const email = String(body.email || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const newPassword = String(body.newPassword || '');

  if (!secret || secret !== bootstrap) {
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

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const passwordHash = hashSync(newPassword, 12);
  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      // Clear 2FA so locked-out admin can regain access without authenticator
      totpEnabled: false,
      totpSecret: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  });

  return NextResponse.json({
    ok: true,
    email: user.email,
    role: 'SUPER_ADMIN',
    message: 'Password reset. Sign in, then remove ADMIN_BOOTSTRAP_SECRET from Vercel.',
  });
}
