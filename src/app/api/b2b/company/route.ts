import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isCompanyCtx, requireB2BCompany } from '@/lib/b2b/company-auth';
import { b2bPreviewWriteBlocked } from '@/lib/b2b-preview';

export async function GET() {
  const ctx = await requireB2BCompany();
  if (!isCompanyCtx(ctx)) return ctx;
  return NextResponse.json({ company: ctx.company });
}

export async function PATCH(req: NextRequest) {
  const blocked = b2bPreviewWriteBlocked();
  if (blocked) return NextResponse.json(blocked, { status: 403 });

  const ctx = await requireB2BCompany();
  if (!isCompanyCtx(ctx)) return ctx;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    industry?: string;
    country?: string;
    size?: string;
    slaHours?: number;
  };

  const data: {
    name?: string;
    industry?: string;
    country?: string;
    size?: string;
    slaHours?: number;
  } = {};

  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if (typeof body.industry === 'string' && body.industry.trim()) {
    data.industry = body.industry.trim();
  }
  if (typeof body.country === 'string' && body.country.trim()) {
    data.country = body.country.trim();
  }
  if (typeof body.size === 'string' && body.size.trim()) data.size = body.size.trim();
  if (typeof body.slaHours === 'number' && Number.isFinite(body.slaHours)) {
    data.slaHours = Math.min(720, Math.max(1, Math.round(body.slaHours)));
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: 'No fields' }, { status: 400 });
  }

  try {
    const company = await db.company.update({
      where: { id: ctx.companyId },
      data,
    });
    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        country: company.country,
        size: company.size,
        plan: company.plan,
        credits: company.credits,
        slaHours: company.slaHours,
        status: company.status,
      },
    });
  } catch (err) {
    console.error('[api/b2b/company PATCH]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
