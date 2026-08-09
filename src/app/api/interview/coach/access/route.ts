import { NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { getCoachAccess } from '@/lib/coach/access';

export async function GET() {
  try {
    const { userId } = await requireApiAuth();
    const snap = await getCoachAccess(userId);
    return NextResponse.json(snap);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/coach/access]', err);
    // Fail closed — never grant a free start when the gate lookup breaks.
    return NextResponse.json(
      {
        canStart: false,
        remaining: 0,
        gateLabel: 'Free',
        gate: { passportPdf: false, emailPassport: false },
        error: 'Access check unavailable',
      },
      { status: 503 },
    );
  }
}
