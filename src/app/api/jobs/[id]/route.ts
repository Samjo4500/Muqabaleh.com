import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializePublicJob } from '@/lib/ats/serialize';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const job = await db.b2BJob.findFirst({
      where: { id, isPublic: true, status: 'OPEN' },
      include: {
        company: {
          select: { id: true, name: true, industry: true, country: true },
        },
        _count: { select: { applications: true } },
      },
    });
    if (!job) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ job: serializePublicJob(job) });
  } catch (e) {
    console.error('GET /api/jobs/[id]', e);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
