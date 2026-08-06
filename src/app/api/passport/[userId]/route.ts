import { NextResponse } from 'next/server';
import { buildPassport } from '@/lib/passport';

export const dynamic = 'force-dynamic';

/** Public shareable passport (only when candidate is publicly visible). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const passport = await buildPassport(userId, { forPublic: true });
    if (!passport) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ passport });
  } catch (err) {
    console.error('[GET /api/passport/[userId]]', err);
    return NextResponse.json({ error: 'Failed to load passport' }, { status: 500 });
  }
}
