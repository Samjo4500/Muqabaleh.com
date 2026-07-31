import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSchema = z.object({
  industry: z.string().min(1),
  experience: z.string().min(1),
  type: z.enum(['BEHAVIORAL', 'TECHNICAL']),
  interviewerGender: z.enum(['MALE', 'FEMALE']),
  language: z.enum(['AR', 'EN']).default('AR'),
});

// POST /api/interviews — create new interview
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { ar: 'يجب تسجيل الدخول', en: 'Login required' } }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: { ar: 'بيانات غير صالحة', en: 'Invalid data' }, details: parsed.error.flatten() }, { status: 400 });
    }

    const { industry, experience, type, interviewerGender, language } = parsed.data;

    // Check sessions left
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.sessionsLeft < 1) {
      return NextResponse.json({ error: { ar: 'لا توجد جلسات متبقية. يرجى شراء باقة.', en: 'No sessions left. Please purchase a package.' } }, { status: 403 });
    }

    // Check for IN_PROGRESS interview
    const existing = await db.interview.findFirst({
      where: { userId, status: 'IN_PROGRESS', mode: 'AI' },
    });
    if (existing) {
      return NextResponse.json({ error: { ar: 'لديك مقابلة جارية بالفعل', en: 'You have an interview in progress' }, interviewId: existing.id }, { status: 409 });
    }

    // Create interview
    const interview = await db.interview.create({
      data: {
        user: { connect: { id: userId } },
        mode: 'AI',
        type,
        industry,
        experience,
        language,
        status: 'PENDING',
        interviewerGender,
      },
    });

    return NextResponse.json({ interviewId: interview.id }, { status: 201 });
  } catch (err) {
    console.error('POST /api/interviews error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ في الخادم', en: 'Server error' } }, { status: 500 });
  }
}

// GET /api/interviews — list user's interviews
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { ar: 'يجب تسجيل الدخول', en: 'Login required' } }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    if (industry) where.industry = industry;
    if (type) where.type = type;

    const interviews = await db.interview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { sequence: 'asc' } } },
      take: 50,
    });

    return NextResponse.json({ interviews });
  } catch (err) {
    console.error('GET /api/interviews error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ في الخادم', en: 'Server error' } }, { status: 500 });
  }
}
