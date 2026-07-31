import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/interviews/[id]/report — get report data (PDF generation can be added later)
export async function GET(
  _req: NextRequest,
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
      return NextResponse.json({ error: { ar: 'التقرير غير جاهز بعد', en: 'Report not ready' } }, { status: 400 });
    }

    const report = {
      id: interview.id,
      overallScore: interview.overallScore,
      contentScore: interview.contentScore,
      clarityScore: interview.clarityScore,
      confidenceScore: interview.confidenceScore,
      culturalFitScore: interview.culturalFitScore,
      feedback: interview.feedback,
      strengths: interview.strengths ? JSON.parse(interview.strengths) : [],
      improvements: interview.improvements ? JSON.parse(interview.improvements) : [],
      recommendation: interview.recommendation,
      verificationId: interview.verificationId,
      expiresAt: interview.expiresAt,
      type: interview.type,
      industry: interview.industry,
      language: interview.language,
      completedAt: interview.updatedAt,
      candidateName: interview.user ? undefined : interview.guestName,
    };

    return NextResponse.json({ report });
  } catch (err) {
    console.error('Report error:', err);
    return NextResponse.json({ error: { ar: 'حدث خطأ في الخادم', en: 'Server error' } }, { status: 500 });
  }
}
