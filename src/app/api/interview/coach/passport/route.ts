import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { getCoachAccess } from '@/lib/coach/access';
import { getInterviewConfig } from '@/lib/coach/config';
import { buildPassportPdfBuffer } from '@/lib/coach/passport-pdf';
import type { CoachScoreResult } from '@/lib/coach/types';

export async function GET(req: NextRequest) {
  try {
    const { userId, session } = await requireApiAuth();
    const access = await getCoachAccess(userId);
    if (!access.gate.passportPdf) {
      return NextResponse.json(
        { error: 'Upgrade required to download passport PDF', upgradeRequired: true },
        { status: 402 },
      );
    }

    const interviewId = req.nextUrl.searchParams.get('interviewId');
    if (!interviewId) {
      return NextResponse.json({ error: 'interviewId required' }, { status: 400 });
    }

    let interview;
    try {
      interview = await db.interview.findFirst({
        where: { id: interviewId, userId },
      });
    } catch (err) {
      console.error('[api/coach/passport] db', err);
      return NextResponse.json({ error: 'Lookup failed' }, { status: 200 });
    }

    if (!interview?.verificationId || interview.overallScore == null) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const cfg = getInterviewConfig();
    const strengths = safeJsonArray(interview.strengths);
    const improvements = safeJsonArray(interview.improvements);
    const score: CoachScoreResult = {
      overallScore: interview.overallScore,
      grade: (interview.recommendation as CoachScoreResult['grade']) || 'B',
      competencyBreakdown: [
        { name: 'Communication', score: interview.contentScore ?? interview.overallScore },
        { name: 'Technical Depth', score: interview.clarityScore ?? interview.overallScore },
        { name: 'Problem Solving', score: interview.overallScore },
        { name: 'Cultural Fit', score: interview.culturalFitScore ?? interview.overallScore },
        { name: 'Confidence', score: interview.confidenceScore ?? interview.overallScore },
      ],
      strengths,
      improvements,
      recommendedNextSteps: interview.feedback || 'Keep practicing on Muqabaleh.',
    };

    const email = session.user?.email || '';
    const rtl = interview.language !== 'EN';
    const pdf = await buildPassportPdfBuffer({
      candidateName: session.user?.name || email.split('@')[0] || 'Candidate',
      role:
        interview.position?.startsWith('coach-session:')
          ? interview.industry
          : interview.position || interview.industry,
      industry: interview.industry,
      seniority: interview.experience || 'Mid-level',
      language: interview.language === 'EN' ? 'English' : 'Arabic',
      interviewDate: interview.createdAt.toISOString().slice(0, 10),
      score,
      verificationId: interview.verificationId,
      verifyUrl: `${cfg.brand.verifyBaseUrl}/${interview.verificationId}`,
      rtl,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="muqabaleh-interview-passport.pdf"',
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/coach/passport]', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}

function safeJsonArray(raw: string | null): string[] {
  if (!raw) return ['—', '—', '—'];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String).slice(0, 3);
  } catch {
    /* ignore */
  }
  return [raw.slice(0, 120), '—', '—'];
}
