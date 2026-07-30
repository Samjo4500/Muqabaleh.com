import { NextRequest, NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { z } from 'zod';

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
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

    // TODO: Send email with reset link (Phase G)
    // For now, the token is stored and can be used via a future reset endpoint

    return NextResponse.json({ message: 'تم إرسال رابط إعادة التعيين إن وُجد الحساب' });
  } catch (e) {
    console.error('Forgot password error:', e);
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    );
  }
}
