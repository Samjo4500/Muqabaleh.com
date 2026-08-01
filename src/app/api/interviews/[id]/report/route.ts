import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/interviews/[id]/report — returns report JSON data
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: { ar: '\u064a\u062c\u0628 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644', en: 'Login required' } }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;

    const interview = await db.interview.findFirst({
      where: { id, userId },
    });

    if (!interview) {
      return NextResponse.json({ error: { ar: '\u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629', en: 'Interview not found' } }, { status: 404 });
    }

    if (interview.status !== 'COMPLETED') {
      return NextResponse.json({ error: { ar: '\u0627\u0644\u062a\u0642\u0631\u064a\u0631 \u063a\u064a\u0631 \u062c\u0627\u0647\u0632 \u0628\u0639\u062f', en: 'Report not ready' } }, { status: 400 });
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
      candidateName: interview.userId ? undefined : interview.guestName,
    };

    return NextResponse.json({ report });
  } catch (err) {
    console.error('Report error:', err);
    return NextResponse.json({ error: { ar: '\u062d\u062f\u062b \u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062e\u0627\u062f\u0645', en: 'Server error' } }, { status: 500 });
  }
}
