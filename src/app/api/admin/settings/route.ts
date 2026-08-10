import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

/**
 * GET /api/admin/settings?key=general
 * PUT /api/admin/settings  { key, value }
 * Persists Super Admin config drafts to AdminSetting (no schema change).
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const key = (req.nextUrl.searchParams.get('key') || '').trim();
  if (!key) {
    const items = await db.adminSetting.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ items });
  }

  const row = await db.adminSetting.findUnique({ where: { key } });
  return NextResponse.json({
    key,
    value: (row?.value as Record<string, unknown> | null) ?? null,
    updatedAt: row?.updatedAt ?? null,
  });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    key?: string;
    value?: Record<string, unknown>;
  };
  const key = String(body.key || '').trim();
  if (!key || !/^[a-zA-Z0-9._:-]{1,80}$/.test(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }
  const value = (
    body.value && typeof body.value === 'object' ? body.value : {}
  ) as Prisma.InputJsonValue;

  const row = await db.adminSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'admin_settings',
      entityId: row.id,
      details: { key },
    });
  }

  return NextResponse.json({ ok: true, key: row.key, updatedAt: row.updatedAt });
}
