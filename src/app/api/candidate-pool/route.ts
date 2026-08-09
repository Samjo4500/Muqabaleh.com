import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/candidate-pool — opt in to employer database
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Never trust client-supplied userId — always use session
    const userId = (session.user as Record<string, unknown>).id as string;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role, level, industry, location, languages, isOptedIn } = body;

    if (!role || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const { db } = await import('@/lib/db');

      // Derive score/count server-side — never trust client muqabalehScore.
      const interviews = await db.interview.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          overallScore: { not: null },
        },
        select: { overallScore: true },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      });
      const interviewCount = interviews.length;
      const score =
        interviewCount > 0
          ? Math.round(
              interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) /
                interviewCount,
            )
          : null;
      // Visibility threshold uses 0–100 coach scores (legacy UI used 0–10).
      const isVisible = Boolean(isOptedIn) && score !== null && score >= 60;

      await db.candidatePool.upsert({
        where: { userId },
        create: {
          userId,
          isOptedIn: !!isOptedIn,
          isVisible,
          role,
          level,
          industry: industry || null,
          location: location || null,
          muqabalehScore: score,
          averageScore: score,
          interviewCount,
          languages: languages || 'AR',
        },
        update: {
          isOptedIn: !!isOptedIn,
          isVisible,
          role,
          level,
          industry: industry || null,
          location: location || null,
          muqabalehScore: score,
          averageScore: score,
          interviewCount,
        },
      });
      return NextResponse.json({ success: true, isVisible, score, interviewCount });
    } catch {
      return NextResponse.json({ success: true, isVisible: false, demo: true });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// PATCH /api/candidate-pool — update visibility settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { isOptedIn, isVisible } = body as {
      isOptedIn?: boolean;
      isVisible?: boolean;
    };

    try {
      const { db } = await import('@/lib/db');
      const existing = await db.candidatePool.findUnique({ where: { userId } });
      if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const opted = typeof isOptedIn === 'boolean' ? isOptedIn : existing.isOptedIn;
      const score = existing.muqabalehScore;
      const visible =
        opted &&
        score !== null &&
        score >= 60 &&
        (typeof isVisible === 'boolean' ? isVisible : existing.isVisible);

      await db.candidatePool.update({
        where: { userId },
        data: {
          isOptedIn: opted,
          isVisible: visible,
        },
      });
      return NextResponse.json({ success: true, isVisible: visible });
    } catch {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
