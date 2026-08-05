import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { memoryStore } from '@/lib/interview/memory-store';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Registration and email required', code: 'AUTH_REQUIRED' },
      { status: 401 },
    );
  }
  const userId =
    (session.user as { id?: string }).id ||
    req.nextUrl.searchParams.get('userId') ||
    '';
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'));
  const pageSize = 10;

  try {
    const [total, rows] = await Promise.all([
      db.interviewSession.count({ where: { userId } }),
      db.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          status: true,
          overallScore: true,
          language: true,
          numQuestionsTotal: true,
          numQuestionsAnswered: true,
          createdAt: true,
          completedAt: true,
          prequal: {
            select: {
              targetRole: true,
              seniorityLevel: true,
              interviewRound: true,
              userEmail: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      page,
      pageSize,
      total,
      sessions: rows,
    });
  } catch {
    const all = memoryStore.listSessions(userId);
    const slice = all.slice((page - 1) * pageSize, page * pageSize).map((s) => {
      const p = memoryStore.getPrequal(s.prequalId);
      return {
        id: s.id,
        status: s.status,
        overallScore: s.overallScore,
        language: s.language,
        numQuestionsTotal: s.numQuestionsTotal,
        numQuestionsAnswered: s.numQuestionsAnswered,
        createdAt: s.createdAt,
        completedAt: s.completedAt,
        prequal: p
          ? {
              targetRole: p.targetRole,
              seniorityLevel: p.seniorityLevel,
              interviewRound: p.interviewRound,
              userEmail: p.userEmail,
            }
          : null,
      };
    });
    return NextResponse.json({
      page,
      pageSize,
      total: all.length,
      sessions: slice,
    });
  }
}
