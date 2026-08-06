import { NextResponse } from 'next/server';
import { ApiError, requireApiAuth } from '@/lib/session';
import { buildPassport } from '@/lib/passport';

export const dynamic = 'force-dynamic';

/** Owner passport: latest Muqabaleh score + verified certificates. */
export async function GET() {
  try {
    const { userId } = await requireApiAuth();
    const passport = await buildPassport(userId);
    if (!passport) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ passport });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[GET /api/candidate/passport]', err);
    return NextResponse.json({ error: 'Failed to load passport' }, { status: 500 });
  }
}
