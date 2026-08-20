import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '../_lib';
import {
  activateStudent100Claim,
  listStudent100Claims,
  rejectStudent100Claim,
  getStudent100Status,
  countStudent100Pending,
} from '@/lib/student100/campaign';

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;
  try {
    const [campaign, items, pending] = await Promise.all([
      getStudent100Status(),
      listStudent100Claims(),
      countStudent100Pending(),
    ]);
    return NextResponse.json({ campaign, items, pending });
  } catch (err) {
    console.error('GET /api/admin/student100', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    action?: string;
  };
  const id = String(body.id || '');
  const action = String(body.action || '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  if (action === 'activate') {
    const result = await activateStudent100Claim(id, 'en');
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  if (action === 'reject') {
    const result = await rejectStudent100Claim(id);
    if (!result.ok) return NextResponse.json({ error: 'reject_failed' }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
}
