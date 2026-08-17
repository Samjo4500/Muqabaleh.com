import { NextRequest, NextResponse } from 'next/server';
import { applyPreference, loadPrefByToken } from '@/lib/nurture/prefs';
import { localeFromPreferred } from '@/lib/nurture/constants';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const pref = await loadPrefByToken(token);
  if (!pref) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({
    ok: true,
    frequency: pref.frequency,
    pausedUntil: pref.pausedUntil,
    unsubscribed: !!pref.unsubscribedAt,
    locale: localeFromPreferred(pref.lead.preferredLanguage),
    name: pref.lead.fullName,
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const token = String(body.token || '');
  const action = String(body.action || '');
  if (!['LESS_OFTEN', 'PAUSE_30', 'UNSUBSCRIBE', 'RESUME'].includes(action)) {
    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
  }
  const updated = await applyPreference(
    token,
    action as 'LESS_OFTEN' | 'PAUSE_30' | 'UNSUBSCRIBE' | 'RESUME',
  );
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({
    ok: true,
    frequency: updated.frequency,
    pausedUntil: updated.pausedUntil,
    unsubscribed: !!updated.unsubscribedAt,
  });
}
