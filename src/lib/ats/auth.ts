import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export type AtsSessionUser = {
  id: string;
  email: string;
  role: string;
  companyId?: string | null;
  partnerId?: string | null;
};

export async function getAtsSession(): Promise<AtsSessionUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as AtsSessionUser | undefined;
  if (!user?.id) return null;
  return user;
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function requireCompanyUser(): Promise<
  { user: AtsSessionUser; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  const user = await getAtsSession();
  if (!user) return { error: unauthorized() };
  const allowed = ['COMPANY_ADMIN', 'SUPER_ADMIN'];
  if (!allowed.includes(user.role)) {
    return { error: forbidden() };
  }
  if (user.role !== 'SUPER_ADMIN' && !user.companyId) {
    return { error: forbidden() };
  }
  return { user };
}

/** Company admin for a job, partner owning the company, or super admin. */
export async function canManageJob(jobId: string, user: AtsSessionUser) {
  const job = await db.b2BJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      companyId: true,
      company: { select: { partnerId: true } },
    },
  });
  if (!job) return null;
  if (user.role === 'SUPER_ADMIN') return job;
  if (user.role === 'COMPANY_ADMIN' && user.companyId === job.companyId) {
    return job;
  }
  if (
    (user.role === 'PARTNER_ADMIN' || user.role === 'PARTNER_MEMBER') &&
    user.partnerId &&
    job.company.partnerId === user.partnerId
  ) {
    return job;
  }
  return null;
}

export async function partnerCompanyIds(partnerId: string) {
  const companies = await db.company.findMany({
    where: { partnerId },
    select: { id: true },
  });
  return companies.map((c) => c.id);
}
