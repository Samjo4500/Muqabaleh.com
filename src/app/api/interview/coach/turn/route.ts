import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { generateCoachTurn } from '@/lib/coach/gemini';
import { getCoachAccess } from '@/lib/coach/access';
import {
  getCoachSessionForUser,
  persistCoachHistory,
  startCoachSession,
} from '@/lib/coach/session';
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
      userMessage?: string;
      sessionId?: string;
    };

    if (!body.prep?.role || !body.prep?.industry || !body.prep?.seniority) {
      return NextResponse.json({ error: 'Missing prep selections' }, { status: 400 });
    }

    const email = session.user?.email || '';
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    let sessionId = body.sessionId;
    if (sessionId) {
      const loaded = await getCoachSessionForUser(userId, sessionId);
      if (!loaded.ok) {
        return NextResponse.json({ error: loaded.error }, { status: loaded.status });
      }
      if (loaded.session.status === 'completed') {
        return NextResponse.json(
          { error: 'Interview already completed', complete: true },
          { status: 409 },
        );
      }
    } else {
      // Auto-start under hard quota — no anonymous burn of Gemini turns.
      const started = await startCoachSession({
        userId,
        userEmail: email,
        prep: body.prep,
        resumeIfActive: true,
      });
      if (!started.ok) {
        await trackCoachEvent(userId, 'coach.quota_blocked', { at: 'turn' });
        return NextResponse.json(
          {
            error: started.error,
            upgradeRequired: started.upgradeRequired,
          },
          { status: started.status },
        );
      }
      sessionId = started.session.sessionId;
    }

    // Soft re-check: completed-count gate (active sessions don't consume).
    const access = await getCoachAccess(userId);
    if (
      !access.canStart &&
      access.activeSessionId &&
      access.activeSessionId !== sessionId
    ) {
      await trackCoachEvent(userId, 'coach.quota_blocked', { at: 'turn_mismatch' });
      return NextResponse.json(
        {
          error: access.reason || 'Interview quota reached.',
          upgradeRequired: true,
        },
        { status: 402 },
      );
    }

    const candidateName = session.user?.name || email.split('@')[0] || 'Candidate';
    const prior = Array.isArray(body.history) ? body.history : [];

    const { reply, complete } = await generateCoachTurn({
      prep: body.prep,
      candidateName,
      history: prior,
      userMessage: body.userMessage,
    });

    const next: ChatMessage[] = [...prior];
    if (body.userMessage?.trim()) {
      next.push({ role: 'user', content: body.userMessage.trim() });
    }
    next.push({ role: 'assistant', content: reply });

    await persistCoachHistory({
      userId,
      sessionId,
      history: next,
      prep: body.prep,
    });

    await trackCoachEvent(userId, 'coach.turn', {
      sessionId,
      turns: next.length,
      complete,
    });

    return NextResponse.json({ reply, complete, sessionId, history: next });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/coach/turn]', err);
    return NextResponse.json({
      reply:
        'Thank you for that answer. Could you share a specific example with measurable results?',
      complete: false,
    });
  }
}
