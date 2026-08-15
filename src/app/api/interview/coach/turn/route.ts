import { NextRequest } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { streamCoachTurn } from '@/lib/coach/gemini';
import { getCoachAccess } from '@/lib/coach/access';
import {
  getCoachSessionForUser,
  persistCoachHistory,
  startCoachSession,
} from '@/lib/coach/session';
import { trackCoachEvent } from '@/lib/coach/analytics';
import type { ChatMessage, PrepSelections } from '@/lib/coach/types';
import { enforceIpRateLimit } from '@/lib/rate-limit';

export const maxDuration = 30;

function sseResponse(write: (send: (event: string, data: unknown) => void) => Promise<void>) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };
      try {
        await write(send);
      } catch (err) {
        console.error('[api/coach/turn] stream failed', err);
        send('error', {
          error: 'Something went wrong. Try again.',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

function jsonError(error: string, status: number, extra?: Record<string, unknown>) {
  return Response.json({ error, ...extra }, { status });
}

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
      return jsonError('Missing prep selections', 400);
    }

    const email = session.user?.email || '';
    if (!email) {
      return jsonError('Email required', 400);
    }

    let sessionId = body.sessionId;
    if (sessionId) {
      const loaded = await getCoachSessionForUser(userId, sessionId);
      if (!loaded.ok) {
        return jsonError(loaded.error, loaded.status);
      }
      if (loaded.session.status === 'completed') {
        return jsonError('Interview already completed', 409, { complete: true });
      }
    } else {
      const started = await startCoachSession({
        userId,
        userEmail: email,
        prep: body.prep,
        resumeIfActive: true,
      });
      if (!started.ok) {
        await trackCoachEvent(userId, 'coach.quota_blocked', { at: 'turn' });
        return jsonError(started.error, started.status, {
          upgradeRequired: started.upgradeRequired,
        });
      }
      sessionId = started.session.sessionId;
    }

    const access = await getCoachAccess(userId);
    if (
      !access.canStart &&
      access.activeSessionId &&
      access.activeSessionId !== sessionId
    ) {
      await trackCoachEvent(userId, 'coach.quota_blocked', { at: 'turn_mismatch' });
      return jsonError(access.reason || 'Interview quota reached.', 402, {
        upgradeRequired: true,
      });
    }

    const candidateName = session.user?.name || email.split('@')[0] || 'Candidate';
    const prior = Array.isArray(body.history) ? body.history : [];
    const resolvedSessionId = sessionId;

    return sseResponse(async (send) => {
      send('meta', { sessionId: resolvedSessionId });

      const { reply, complete } = await streamCoachTurn(
        {
          prep: body.prep!,
          candidateName,
          history: prior,
          userMessage: body.userMessage,
        },
        (text) => send('token', { text }),
      );

      const next: ChatMessage[] = [...prior];
      if (body.userMessage?.trim()) {
        next.push({ role: 'user', content: body.userMessage.trim() });
      }
      next.push({ role: 'assistant', content: reply });

      await persistCoachHistory({
        userId,
        sessionId: resolvedSessionId,
        history: next,
        prep: body.prep,
      });

      await trackCoachEvent(userId, 'coach.turn', {
        sessionId: resolvedSessionId,
        turns: next.length,
        complete,
      });

      send('done', {
        reply,
        complete,
        sessionId: resolvedSessionId,
        history: next,
      });
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return jsonError(err.message, err.status);
    }
    console.error('[api/coach/turn]', err);
    return sseResponse(async (send) => {
      const reply =
        'Thank you for that answer. Could you share a specific example with measurable results?';
      send('token', { text: reply });
      send('done', { reply, complete: false });
    });
  }
}
