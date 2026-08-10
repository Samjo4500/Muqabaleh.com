import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';

/** AI mock engine sessions (InterviewSession), separate from legacy Interview rows. */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const status = req.nextUrl.searchParams.get('status');

  const items = await db.interviewSession.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { user: { email: { contains: q, mode: 'insensitive' } } },
              { user: { name: { contains: q, mode: 'insensitive' } } },
              { language: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, email: true, name: true, tier: true } },
      prequal: {
        select: {
          targetRole: true,
          targetRoleAr: true,
          seniorityLevel: true,
          interviewRound: true,
          languagePreference: true,
          numQuestions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 150,
  });

  const byStatus = await db.interviewSession.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  return NextResponse.json({ items, byStatus });
}
