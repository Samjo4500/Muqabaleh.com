import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST /api/interviews/[id]/resume — resume an in-progress interview
export async function POST(
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
      where: { id, userId, status: 'IN_PROGRESS' },
      include: { messages: { orderBy: { sequence: 'asc' } } },
    });

    if (!interview) {
      return NextResponse.json({ error: { ar: 'لا توجد مقابلة جارية', en: 'No interview in progress' } }, { status: 404 });
    }

    const questionCount = interview.messages.filter(m => m.role === 'INTERVIEWER').length;

    return NextResponse.json({
      interview: {
        id: interview.id,
        status: interview.status,
        messages: interview.messages.map(m => ({
          role: m.role.toLowerCase(),
          content: m.content,
          sequence: m.sequence,
        })),
        questionNumber: questionCount,
        totalQuestions: 7,
        type: interview.type,
        industry: interview.industry,
        language: interview.language,
        interviewerGender: interview.interviewerGender,
      },
    });
  } catch (err) {
    console.error('POST /api/interviews/[id]/resume error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ في الخادم', en: 'Server error' } }, { status: 500 });
  }
}
