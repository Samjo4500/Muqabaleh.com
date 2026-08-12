import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { completeCoachInterview } from '@/lib/coach/complete';
import { getCoachAccess } from '@/lib/coach/access';
import { trackCoachEvent } from '@/lib/coach/analytics';
import type { ChatMessage, PrepSelections } from '@/lib/coach/types';
import { enforceIpRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/interview/*', 10);
  if (limited) return limited;

  try {
    const { userId, session } = await requireApiAuth();
    const body = (await req.json()) as {
      prep?: PrepSelections;
      history?: ChatMessage[];
      sessionId?: string;
    };

    if (!body.prep || !Array.isArray(body.history) || body.history.length < 2) {
      return NextResponse.json({ error: 'Invalid interview payload' }, { status: 400 });
    }

    const email = session.user?.email || '';
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const access = await getCoachAccess(userId);
    const hasActive =
      !!body.sessionId ||
      !!access.activeSessionId ||
      access.canResume;
    if (!hasActive && !access.canStart) {
      await trackCoachEvent(userId, 'coach.complete_blocked', {
        reason: access.reason,
      });
      return NextResponse.json(
        {
          ok: false,
          error: access.reason || 'Interview quota reached. Upgrade to continue.',
          upgradeRequired: true,
        },
        { status: 402 },
      );
    }

    const result = await completeCoachInterview({
      userId,
      userEmail: email,
      candidateName: session.user?.name || email.split('@')[0] || 'Candidate',
      prep: body.prep,
      history: body.history,
      sessionId: body.sessionId || access.activeSessionId || undefined,
    });

    if (!result.ok) {
      return NextResponse.json(result, {
        status: result.upgradeRequired ? 402 : 400,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/coach/complete]', err);
    const { captureException } = await import('@/lib/sentry');
    await captureException(err, { area: 'interview.complete' });
    return NextResponse.json(
      {
        ok: false,
        error: 'Could not complete interview safely',
        upgradeRequired: true,
      },
      { status: 200 },
    );
  }
}
