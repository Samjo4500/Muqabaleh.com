import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

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
          companyId: true,
          isActive: true,
          lastLoginAt: true,
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

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;
    if (typeof body.role === 'string') data.role = body.role;
    if (typeof body.tier === 'string') data.tier = body.tier;

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'No updates' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, email: true, isActive: true, role: true, tier: true },
    });

    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'UPDATE_USER',
        entity: 'users',
        entityId: id,
        details: data as Prisma.InputJsonValue,
      });
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('PATCH /api/admin/users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    // Soft-delete: deactivate rather than hard delete for safety
    const updated = await db.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });

    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'DEACTIVATE_USER',
        entity: 'users',
        entityId: id,
      });
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('DELETE /api/admin/users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
