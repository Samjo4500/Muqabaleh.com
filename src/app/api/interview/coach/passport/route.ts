import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { getCoachAccess } from '@/lib/coach/access';
import { getInterviewConfig } from '@/lib/coach/config';
import { buildPassportPdfBuffer } from '@/lib/coach/passport-pdf';
import { trackCoachEvent } from '@/lib/coach/analytics';
import type { CoachScoreResult, ScoringMode } from '@/lib/coach/types';
import { enforceIpRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/interview/*', 10);
  if (limited) return limited;

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

    // Refuse passport PDF for provisional / heuristic scores.
    const scoringMode = await resolveScoringMode(interview.position);
    if (scoringMode === 'provisional') {
      return NextResponse.json(
        {
          error:
            'Passport PDF is only available for model-scored interviews. Retry when AI scoring is available.',
          scoringMode: 'provisional',
          upgradeRequired: false,
        },
        { status: 403 },
      );
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
      scoringMode: 'model',
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

    await trackCoachEvent(userId, 'coach.passport_download', { interviewId });

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
    const { captureException } = await import('@/lib/sentry');
    await captureException(err, { area: 'passport.generate' });
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}

async function resolveScoringMode(position: string | null): Promise<ScoringMode> {
  if (!position?.startsWith('coach-session:')) return 'model';
  const sessionId = position.slice('coach-session:'.length);
  if (!sessionId) return 'model';
  try {
    const row = await db.interviewSession.findUnique({
      where: { id: sessionId },
      select: { fullReport: true },
    });
    const report = row?.fullReport as
      | { scoringMode?: ScoringMode; score?: { scoringMode?: ScoringMode } }
      | null;
    const mode = report?.scoringMode || report?.score?.scoringMode;
    return mode === 'provisional' ? 'provisional' : 'model';
  } catch {
    return 'model';
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
