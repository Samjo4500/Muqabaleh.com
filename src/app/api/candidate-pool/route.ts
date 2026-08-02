import { NextRequest, NextResponse } from 'next/server';

// POST /api/candidate-pool — opt in to employer database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role, level, industry, location, muqabalehScore, interviewCount, languages, isOptedIn } = body;

    if (!userId || !role || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const score = muqabalehScore ?? null;
    const isVisible = isOptedIn && score !== null && score >= 6;

    try {
      const { db } = await import('@/lib/db');
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
          interviewCount: interviewCount || 0,
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
          interviewCount: interviewCount || 0,
        },
      });
      return NextResponse.json({ success: true, isVisible });
    } catch {
      return NextResponse.json({ success: true, isVisible, demo: true });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// PATCH /api/candidate-pool — update visibility settings
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, isVisible, availability, location, industry } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
      const { db } = await import('@/lib/db');
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (typeof isVisible === 'boolean') updateData.isVisible = isVisible;
      if (availability) updateData.availability = availability;
      if (location) updateData.location = location;
      if (industry) updateData.industry = industry;

      await db.candidatePool.update({
        where: { userId },
        data: updateData,
      });
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ success: true, demo: true });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
