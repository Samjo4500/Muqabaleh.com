import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { generateCoachTurn } from '@/lib/coach/gemini';
import type { ChatMessage, PrepSelections } from '@/lib/coach/types';

export async function POST(req: NextRequest) {
  try {
    const { session } = await requireApiAuth();
    const body = (await req.json()) as {
      prep?: PrepSelections;
      history?: ChatMessage[];
      userMessage?: string;
    };

    if (!body.prep?.role || !body.prep?.industry || !body.prep?.seniority) {
      return NextResponse.json({ error: 'Missing prep selections' }, { status: 400 });
    }

    const email = session.user?.email || '';
    const candidateName = session.user?.name || email.split('@')[0] || 'Candidate';

    const { reply, complete } = await generateCoachTurn({
      prep: body.prep,
      candidateName,
      history: Array.isArray(body.history) ? body.history : [],
      userMessage: body.userMessage,
    });

    return NextResponse.json({ reply, complete });
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
