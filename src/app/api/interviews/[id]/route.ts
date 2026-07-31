import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/interviews/[id] — get interview detail with messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { ar: 'يجب تسجيل الدخول', en: 'Login required' } }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;

    const interview = await db.interview.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { sequence: 'asc' } } },
    });

    if (!interview) {
      return NextResponse.json({ error: { ar: 'المقابلة غير موجودة', en: 'Interview not found' } }, { status: 404 });
    }

    // Parse JSON arrays
    const result = {
      ...interview,
      strengths: interview.strengths ? JSON.parse(interview.strengths) : null,
      improvements: interview.improvements ? JSON.parse(interview.improvements) : null,
      messages: interview.messages,
    };

    return NextResponse.json({ interview: result });
  } catch (err) {
    console.error('GET /api/interviews/[id] error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ في الخادم', en: 'Server error' } }, { status: 500 });
  }
}
