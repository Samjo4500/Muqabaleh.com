import { NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { getPartnerDashboard, listClients } from '@/lib/partner/service';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  const dash = await getPartnerDashboard(ctx.partnerId, ctx.usingDemo);
  const clients = await listClients(ctx.partnerId, ctx.usingDemo);
  return NextResponse.json({
    kpis: dash.kpis,
    usageSeries: dash.usageSeries,
    byIndustry: clients.reduce<Record<string, number>>((acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + c.interviewsCount;
      return acc;
    }, {}),
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      interviewsCount: c.interviewsCount,
      jobsCount: c.jobsCount,
      credits: c.credits,
      status: c.status,
    })),
  });
}
