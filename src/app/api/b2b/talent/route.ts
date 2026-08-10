import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getAtsSession,
  unauthorized,
  forbidden,
  partnerCompanyIds,
} from '@/lib/ats/auth';
import { serializeTalent } from '@/lib/ats/serialize';

/** Employer / partner talent-pool search. */
export async function GET(req: NextRequest) {
  const user = await getAtsSession();
  if (!user) return unauthorized();

  const allowed = [
    'COMPANY_ADMIN',
    'PARTNER_ADMIN',
    'PARTNER_MEMBER',
    'SUPER_ADMIN',
  ];
  if (!allowed.includes(user.role)) return forbidden();

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const role = searchParams.get('role') || '';
    const level = searchParams.get('level') || '';
    const location = searchParams.get('location') || '';
    const industry = searchParams.get('industry') || '';
    const openOnly = searchParams.get('openToWork') !== 'false';

    // Partners only see applicants to their client companies — no global pool.
    let partnerApplicantFilter: { userId?: { in: string[] } } = {};
    if (
      (user.role === 'PARTNER_ADMIN' || user.role === 'PARTNER_MEMBER') &&
      user.partnerId
    ) {
      const companyIds = await partnerCompanyIds(user.partnerId);
      const applicantIds = companyIds.length
        ? (
            await db.jobApplication.findMany({
              where: { job: { companyId: { in: companyIds } } },
              select: { candidateId: true },
              distinct: ['candidateId'],
              take: 500,
            })
          ).map((a) => a.candidateId)
        : [];
      if (!applicantIds.length) {
        return NextResponse.json({ candidates: [], total: 0 });
      }
      partnerApplicantFilter = { userId: { in: applicantIds } };
    }

    const rows = await db.candidatePool.findMany({
      where: {
        isOptedIn: true,
        isVisible: true,
        ...partnerApplicantFilter,
        ...(openOnly ? { openToWork: true } : {}),
        ...(role ? { role: { contains: role, mode: 'insensitive' } } : {}),
        ...(level ? { level } : {}),
        ...(location
          ? { location: { contains: location, mode: 'insensitive' } }
          : {}),
        ...(industry
          ? { industry: { contains: industry, mode: 'insensitive' } }
          : {}),
        ...(q
          ? {
              OR: [
                { role: { contains: q, mode: 'insensitive' } },
                { headline: { contains: q, mode: 'insensitive' } },
                { skills: { contains: q, mode: 'insensitive' } },
                { summary: { contains: q, mode: 'insensitive' } },
                { desiredRole: { contains: q, mode: 'insensitive' } },
                { user: { name: { contains: q, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, country: true, image: true },
        },
      },
      orderBy: [{ muqabalehScore: 'desc' }, { updatedAt: 'desc' }],
      take: 100,
    });

    return NextResponse.json({
      candidates: rows.map(serializeTalent),
      total: rows.length,
    });
  } catch (e) {
    console.error('GET /api/b2b/talent', e);
    return NextResponse.json({ candidates: [], total: 0 });
  }
}
