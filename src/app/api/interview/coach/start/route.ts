import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { startCoachSession } from '@/lib/coach/session';
import { trackCoachEvent } from '@/lib/coach/analytics';
import type { PrepSelections } from '@/lib/coach/types';
import { enforceIpRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limited = await enforceIpRateLimit('/api/interview/*', 10);
  if (limited) return limited;

  try {
    const { userId, session } = await requireApiAuth();
    const body = (await req.json()) as {
      prep?: PrepSelections;
      resumeIfActive?: boolean;
    };

    if (!body.prep?.role || !body.prep?.industry || !body.prep?.seniority) {
      return NextResponse.json({ error: 'Missing prep selections' }, { status: 400 });
    }

    const email = session.user?.email || '';
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const result = await startCoachSession({
      userId,
      userEmail: email,
      prep: body.prep,
      resumeIfActive: body.resumeIfActive !== false,
    });

    if (!result.ok) {
      if (result.status === 402) {
        await trackCoachEvent(userId, 'coach.quota_blocked', { at: 'start' });
      }
      return NextResponse.json(
        {
          error: result.error,
          upgradeRequired: result.upgradeRequired,
        },
        { status: result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      resumed: result.resumed,
      sessionId: result.session.sessionId,
      prep: result.session.prep,
      history: result.session.history,
      status: result.session.status,
      startedAt: result.session.startedAt,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/coach/start]', err);
    return NextResponse.json({ error: 'Could not start session' }, { status: 500 });
  }
}
