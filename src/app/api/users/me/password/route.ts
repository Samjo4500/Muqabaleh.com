import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { compare, hashSync } from 'bcryptjs';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = passwordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const valid = await compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashSync(newPassword, 12) },
    });

    return NextResponse.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة' },
        { status: 400 }
      );
    }
    console.error('Change password error:', e);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
