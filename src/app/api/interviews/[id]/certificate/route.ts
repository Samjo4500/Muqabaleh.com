import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateVerificationId, evaluateInterview } from '@/lib/ai';

// POST /api/interviews/[id]/certificate — generate/ensure certificate
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
      where: { id, userId },
    });

    if (!interview) {
      return NextResponse.json({ error: { ar: 'المقابلة غير موجودة', en: 'Interview not found' } }, { status: 404 });
    }

    if (interview.status !== 'COMPLETED') {
      return NextResponse.json({ error: { ar: 'المقابلة غير مكتملة بعد', en: 'Interview not completed' } }, { status: 400 });
    }

    // If already has verification ID, return it
    if (interview.verificationId) {
      return NextResponse.json({
        verificationId: interview.verificationId,
        overallScore: interview.overallScore,
        expiresAt: interview.expiresAt,
      });
    }

    // Generate new certificate
    const verificationId = generateVerificationId();
    const expiresAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);

    await db.interview.update({
      where: { id },
      data: { verificationId, expiresAt },
    });

    return NextResponse.json({ verificationId, overallScore: interview.overallScore, expiresAt });
  } catch (err) {
    console.error('Certificate error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ في الخادم', en: 'Server error' } }, { status: 500 });
  }
}
