import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const { searchParams } = req.nextUrl;
    const tier = searchParams.get('tier') ?? undefined;
    const search = searchParams.get('search') ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (tier) where.tier = tier;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          country: true,
          tier: true,
          sessionsLeft: true,
          role: true,
          accountType: true,
          isActive: true,
          createdAt: true,
          _count: { select: { interviews: true, payments: true } },
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
