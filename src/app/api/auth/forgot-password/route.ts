import { NextRequest, NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';
import { triggerPasswordResetEmail } from '@/lib/email-triggers';
import { APP_URL } from '@/lib/email';

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const ip = await getClientIp();

  // Rate limit: 3 attempts per IP per 15 min
  const rl = checkRateLimit(ip, '/api/auth/forgot-password', 3);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { email } = forgotSchema.parse(body);

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Always return success to prevent email enumeration
      return NextResponse.json({ message: 'تم إرسال رابط إعادة التعيين إن وُجد الحساب' });
    }

    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashSync(token, 10),
        passwordResetExpiry: expiry,
      },
    });

    // Send password reset email
    const resetLink = `${APP_URL}/auth/reset-password?token=${token}`;
    triggerPasswordResetEmail(user.email, user.name || 'User', resetLink, 'ar').catch(() => {});
    triggerPasswordResetEmail(user.email, user.name || 'User', resetLink, 'en').catch(() => {});

    return NextResponse.json({ message: 'تم إرسال رابط إعادة التعيين إن وُجد الحساب' });
  } catch (e) {
    console.error('Forgot password error:', e);
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    );
  }
}
