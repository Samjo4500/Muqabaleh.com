import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isCompanyCtx, requireB2BCompany } from '@/lib/b2b/company-auth';

/** Read company credits + related payments. Top-up stays request-demo until B2B PayPal. */
export async function GET() {
  const ctx = await requireB2BCompany();
  if (!isCompanyCtx(ctx)) return ctx;

  try {
    const payments = await db.payment.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    return NextResponse.json({
      company: {
        id: ctx.company.id,
        name: ctx.company.name,
        plan: ctx.company.plan,
        credits: ctx.company.credits,
      },
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        type: p.type,
        packageType: p.packageType,
        sessionsCredited: p.sessionsCredited,
        createdAt: p.createdAt.toISOString(),
        capturedAt: p.capturedAt?.toISOString() || null,
      })),
      topUp: {
        mode: 'request_demo',
        href: '/request-demo?from=b2b-billing',
      },
    });
  } catch (err) {
    console.error('[api/b2b/billing]', err);
    return NextResponse.json({ error: 'Failed to load billing' }, { status: 500 });
  }
}
