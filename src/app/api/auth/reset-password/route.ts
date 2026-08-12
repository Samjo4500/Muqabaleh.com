import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { hashSync } from 'bcryptjs';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';
import { enforceIpRateLimit } from '@/lib/rate-limit';

function secretKey() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/auth/*', 5);
  if (limited) return limited;

  try {
    const body = (await req.json()) as {
      token?: string;
      newPassword?: string;
    };
    const token = String(body.token || '');
    const newPassword = String(body.newPassword || '');

    if (!token || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Invalid token or password (min 8 chars)' },
        { status: 400 },
      );
    }

    const key = secretKey();
    if (!key) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const { payload } = await jwtVerify(token, key);
    if (payload.typ !== 'password_reset' || typeof payload.sub !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (
      !user ||
      user.passwordResetToken !== tokenHash ||
      !user.passwordResetExpiry ||
      user.passwordResetExpiry.getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: 'Reset link expired or already used' },
        { status: 400 },
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashSync(newPassword, 12),
        passwordResetToken: null,
        passwordResetExpiry: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[reset-password]', err);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}
