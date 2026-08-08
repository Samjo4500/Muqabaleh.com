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
    return NextResponse.json(
      {
        canStart: true,
        remaining: 1,
        gateLabel: 'Free',
        gate: { passportPdf: false, emailPassport: false },
      },
      { status: 200 },
    );
  }
}
