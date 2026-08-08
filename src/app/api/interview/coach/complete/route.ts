import { NextRequest, NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { completeCoachInterview } from '@/lib/coach/complete';
import type { ChatMessage, PrepSelections } from '@/lib/coach/types';

export async function POST(req: NextRequest) {
  try {
    const { userId, session } = await requireApiAuth();
    const body = (await req.json()) as {
      prep?: PrepSelections;
      history?: ChatMessage[];
    };

    if (!body.prep || !Array.isArray(body.history) || body.history.length < 2) {
      return NextResponse.json({ error: 'Invalid interview payload' }, { status: 400 });
    }

    const email = session.user?.email || '';
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const result = await completeCoachInterview({
      userId,
      userEmail: email,
      candidateName: session.user?.name || email.split('@')[0] || 'Candidate',
      prep: body.prep,
      history: body.history,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/coach/complete]', err);
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
