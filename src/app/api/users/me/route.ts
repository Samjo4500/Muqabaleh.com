import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        country: true,
        industry: true,
        experience: true,
        interviewerGender: true,
        language: true,
        accountType: true,
        role: true,
        companyId: true,
        sessionsLeft: true,
        isActive: true,
        createdAt: true,
        company: {
          select: { id: true, name: true, plan: true, credits: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e) {
    console.error('Get user error:', e);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  experience: z.string().optional(),
  interviewerGender: z.enum(['MALE', 'FEMALE']).optional(),
  language: z.enum(['AR', 'EN']).optional(),
  image: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const user = await db.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true, email: true, name: true, image: true,
        country: true, industry: true, experience: true,
        interviewerGender: true, language: true,
        accountType: true, role: true, companyId: true, sessionsLeft: true,
      },
    });

    return NextResponse.json(user);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: e.errors },
        { status: 400 }
      );
    }
    console.error('Update user error:', e);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
