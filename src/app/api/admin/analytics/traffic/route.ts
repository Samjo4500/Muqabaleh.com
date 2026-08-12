import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '../../_lib';
import { getTrafficAnalytics } from '@/lib/analytics/admin-queries';

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const days = Number(req.nextUrl.searchParams.get('days') || '7');
  try {
    const traffic = await getTrafficAnalytics(days);
    return NextResponse.json({ ok: true, traffic });
  } catch (err) {
    console.error('[admin analytics traffic]', err);
    return NextResponse.json(
      { ok: false, error: 'Traffic analytics unavailable', detail: String(err) },
      { status: 500 },
    );
  }
}
