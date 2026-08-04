import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { fullNameAr: { contains: search } },
      { payoutEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    db.interviewer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.interviewer.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
  });
}
