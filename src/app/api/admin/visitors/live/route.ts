import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../_lib';
import { getLiveVisitors } from '@/lib/visitors/stats';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const live = await getLiveVisitors();
    return NextResponse.json({ ok: true, ...live });
  } catch (err) {
    console.error('[api/admin/visitors/live]', err);
    return NextResponse.json({ ok: false, error: 'Live stats unavailable' }, { status: 500 });
  }
}
