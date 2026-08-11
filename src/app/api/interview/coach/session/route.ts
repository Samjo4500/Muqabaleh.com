import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import {
  findActiveCoachSession,
  getCoachSessionForUser,
  recordCoachIntegritySignal,
} from '@/lib/coach/session';
import { trackCoachEvent } from '@/lib/coach/analytics';

/** Resume active coach session (or fetch by id). */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireApiAuth();
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (sessionId) {
      const loaded = await getCoachSessionForUser(userId, sessionId);
      if (!loaded.ok) {
        return NextResponse.json({ error: loaded.error }, { status: loaded.status });
      }
      return NextResponse.json({
        ok: true,
        sessionId: loaded.session.id,
        status: loaded.session.status,
        prep: loaded.session.prep,
        history: loaded.session.history,
        startedAt: loaded.session.startedAt?.toISOString() ?? null,
      });
    }

    const active = await findActiveCoachSession(userId);
    if (!active) {
      return NextResponse.json({ ok: true, session: null });
    }
    return NextResponse.json({ ok: true, session: active });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/coach/session GET]', err);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}

/** Integrity / anti-cheat soft signals (tab blur, visibility). */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireApiAuth();
    const body = (await req.json()) as {
      sessionId?: string;
      signal?: 'tab_blur' | 'visibility_hidden';
    };
    if (!body.sessionId || !body.signal) {
      return NextResponse.json({ error: 'sessionId and signal required' }, { status: 400 });
    }
    await recordCoachIntegritySignal({
      userId,
      sessionId: body.sessionId,
      signal: body.signal,
    });
    await trackCoachEvent(userId, 'coach.integrity_signal', {
      sessionId: body.sessionId,
      signal: body.signal,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ ok: true });
  }
}
