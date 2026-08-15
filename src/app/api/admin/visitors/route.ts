import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '../_lib';
import { getVisitorDashboard } from '@/lib/visitors/stats';
import type { RangeKey } from '@/lib/visitors/parse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const raw = req.nextUrl.searchParams.get('range') || '24h';
  const range: RangeKey = raw === '7d' || raw === '30d' ? raw : '24h';

  try {
    const report = await getVisitorDashboard(range);
    return NextResponse.json({ ok: true, ...report });
  } catch (err) {
    console.error('[api/admin/visitors]', err);
    return NextResponse.json({ ok: false, error: 'Visitor stats unavailable' }, { status: 500 });
  }
}
