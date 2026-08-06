import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiError, requireApiAuth } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** List job applications for the signed-in candidate. */
export async function GET() {
  try {
    const { userId } = await requireApiAuth();

    const applications = await db.jobApplication.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            titleAr: true,
            city: true,
            country: true,
            employmentType: true,
            careerLevel: true,
            industry: true,
            status: true,
            company: { select: { id: true, name: true, country: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      applications: applications.map((a) => ({
        id: a.id,
        stage: a.stage,
        score: a.score,
        source: a.source,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        job: a.job,
      })),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[GET /api/candidate/applications]', err);
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
  }
}
