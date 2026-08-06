import { NextResponse } from 'next/server';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { getEntitlementSnapshot } from '@/lib/plans/entitlements';

export async function GET() {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const snap = await getEntitlementSnapshot(user.id);
  if (!snap) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(snap);
}
