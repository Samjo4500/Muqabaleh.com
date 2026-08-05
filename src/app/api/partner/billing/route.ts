import { NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { demoStore, DEMO_PARTNER_ID } from '@/lib/partner/demo-data';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  if (ctx.usingDemo || ctx.partnerId === DEMO_PARTNER_ID) {
    return NextResponse.json({
      plan: ctx.partner.plan,
      creditsPool: ctx.partner.creditsPool,
      currency: ctx.partner.currency,
      invoices: demoStore.invoices,
      plans: [
        { id: 'STARTER', priceCents: 49000, credits: 50, label: 'Starter' },
        { id: 'GROWTH', priceCents: 99000, credits: 200, label: 'Growth' },
        { id: 'ENTERPRISE', priceCents: 249000, credits: 750, label: 'Enterprise' },
      ],
    });
  }
  try {
    const { db } = await import('@/lib/db');
    const invoices = await db.partnerInvoice.findMany({
      where: { partnerId: ctx.partnerId },
      orderBy: { issuedAt: 'desc' },
    });
    return NextResponse.json({
      plan: ctx.partner.plan,
      creditsPool: ctx.partner.creditsPool,
      currency: ctx.partner.currency,
      invoices,
      plans: [
        { id: 'STARTER', priceCents: 49000, credits: 50, label: 'Starter' },
        { id: 'GROWTH', priceCents: 99000, credits: 200, label: 'Growth' },
        { id: 'ENTERPRISE', priceCents: 249000, credits: 750, label: 'Enterprise' },
      ],
    });
  } catch {
    return NextResponse.json({ plan: ctx.partner.plan, creditsPool: ctx.partner.creditsPool, invoices: [], plans: [] });
  }
}
