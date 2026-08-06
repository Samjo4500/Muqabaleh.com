import { NextRequest, NextResponse } from 'next/server';
import { JeannieOpportunityStatus } from '@prisma/client';
import { getAtsSession, unauthorized } from '@/lib/ats/auth';
import { getEntitlementSnapshot } from '@/lib/plans/entitlements';
import { generateShortlist } from '@/lib/jeannie/match';
import { listOpportunities } from '@/lib/jeannie/opportunity-service';

export async function GET(req: NextRequest) {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const statusParam = req.nextUrl.searchParams.get('status');
  const status =
    statusParam && Object.values(JeannieOpportunityStatus).includes(statusParam as JeannieOpportunityStatus)
      ? (statusParam as JeannieOpportunityStatus)
      : undefined;

  const opportunities = await listOpportunities(user.id, status);
  return NextResponse.json({ opportunities });
}

/** Generate / refresh Jeannie shortlist (approve-gated, NOT SPAM). */
export async function POST(req: NextRequest) {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const snap = await getEntitlementSnapshot(user.id);
  if (!snap?.canUseJeannie) {
    return NextResponse.json(
      { error: 'Jeannie shortlist requires a Jeannie plan' },
      { status: 403 },
    );
  }

  let limit = 8;
  try {
    const body = (await req.json()) as { limit?: number };
    if (body?.limit) limit = Math.max(1, Math.min(20, Number(body.limit) || 8));
  } catch {
    // optional body
  }

  const opportunities = await generateShortlist(user.id, limit);
  return NextResponse.json({ opportunities, count: opportunities.length });
}
