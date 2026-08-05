import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAtsSession, unauthorized, forbidden } from '@/lib/ats/auth';
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

    const rows = await db.candidatePool.findMany({
      where: {
        isOptedIn: true,
        isVisible: true,
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
