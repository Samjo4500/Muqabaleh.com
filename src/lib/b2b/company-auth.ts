import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireCompanyUser } from '@/lib/ats/auth';

export type CompanyContext = {
  userId: string;
  role: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    industry: string;
    country: string;
    size: string;
    plan: string;
    credits: number;
    slaHours: number;
    status: string;
  };
};

export async function requireB2BCompany(): Promise<
  CompanyContext | NextResponse
> {
  const auth = await requireCompanyUser();
  if (auth.error || !auth.user) {
    return auth.error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { user } = auth;

  let companyId = user.companyId || null;
  if (!companyId && user.role === 'SUPER_ADMIN') {
    const first = await db.company.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    companyId = first?.id || null;
  }
  if (!companyId) {
    return NextResponse.json({ error: 'No company linked' }, { status: 403 });
  }

  const company = await db.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  return {
    userId: user.id,
    role: user.role,
    companyId: company.id,
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
  };
}

export function isCompanyCtx(
  value: CompanyContext | NextResponse,
): value is CompanyContext {
  return !(value instanceof NextResponse);
}

/** Soft seat caps by plan string — no migration. */
export function seatCapForPlan(plan: string): number {
  const p = plan.toUpperCase();
  if (p.includes('ENTERPRISE')) return 50;
  if (p.includes('GROWTH') || p.includes('PRO')) return 15;
  return 5;
}
