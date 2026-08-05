import { NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { demoStore, DEMO_PARTNER_ID } from '@/lib/partner/demo-data';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  if (ctx.usingDemo || ctx.partnerId === DEMO_PARTNER_ID) {
    return NextResponse.json({
      commissionBps: ctx.partner.commissionBps,
      payouts: demoStore.payouts,
      summary: {
        lifetimeCents: demoStore.payouts.reduce((n, p) => n + p.amountCents, 0),
        pendingCents: demoStore.payouts
          .filter((p) => p.status !== 'COMPLETED')
          .reduce((n, p) => n + p.amountCents, 0),
      },
    });
  }
  try {
    const { db } = await import('@/lib/db');
    const payouts = await db.partnerPayout.findMany({
      where: { partnerId: ctx.partnerId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      commissionBps: ctx.partner.commissionBps,
      payouts: payouts.map((p) => ({
        id: p.id,
        amountCents: p.amountCents,
        currency: p.currency,
        status: p.status,
        periodStart: p.periodStart.toISOString(),
        periodEnd: p.periodEnd.toISOString(),
        paidAt: p.paidAt?.toISOString() || null,
        note: p.note,
      })),
      summary: {
        lifetimeCents: payouts.reduce((n, p) => n + p.amountCents, 0),
        pendingCents: payouts
          .filter((p) => p.status !== 'COMPLETED')
          .reduce((n, p) => n + p.amountCents, 0),
      },
    });
  } catch {
    return NextResponse.json({ commissionBps: ctx.partner.commissionBps, payouts: [], summary: { lifetimeCents: 0, pendingCents: 0 } });
  }
}
