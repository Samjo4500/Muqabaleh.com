import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      db.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
      db.payment.count(),
    ]);

    return NextResponse.json({
      data: data.map((p) => ({
        id: p.id,
        email: p.user?.email ?? 'N/A',
        name: p.user?.name ?? null,
        packageType: p.packageType,
        amountUsdCents: p.amountUsdCents,
        status: p.status,
        capturedAt: p.capturedAt,
        createdAt: p.createdAt,
      })),
      total,
    });
  } catch (err) {
    console.error('GET /api/admin/transactions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
