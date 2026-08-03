import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') ?? undefined;
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;
  const interviewerId = searchParams.get('interviewerId') ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (interviewerId) where.interviewerId = interviewerId;
  if (from || to) {
    where.scheduledAt = {} as Record<string, unknown>;
    if (from) (where.scheduledAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.scheduledAt as Record<string, unknown>).lte = new Date(to);
  }

  const [data, total] = await Promise.all([
    db.humanBooking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        interviewer: {
          select: {
            id: true,
            fullName: true,
            fullNameAr: true,
            payoutEmail: true,
          },
        },
      },
    }),
    db.humanBooking.count({ where }),
  ]);

  return NextResponse.json({ data, total });
}
