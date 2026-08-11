import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import {
  isCompanyCtx,
  requireB2BCompany,
  seatCapForPlan,
} from '@/lib/b2b/company-auth';
import { b2bPreviewWriteBlocked } from '@/lib/b2b-preview';

export async function GET() {
  const ctx = await requireB2BCompany();
  if (!isCompanyCtx(ctx)) return ctx;

  try {
    const members = await db.user.findMany({
      where: { companyId: ctx.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        isActive: m.isActive,
        joinedAt: m.createdAt.toISOString(),
        lastLoginAt: m.lastLoginAt?.toISOString() || null,
      })),
      seats: {
        used: members.length,
        cap: seatCapForPlan(ctx.company.plan),
        plan: ctx.company.plan,
      },
    });
  } catch (err) {
    console.error('[api/b2b/team GET]', err);
    return NextResponse.json({ error: 'Failed to load team' }, { status: 500 });
  }
}

/** Invite a teammate as COMPANY_ADMIN (same role until COMPANY_MEMBER exists). */
export async function POST(req: NextRequest) {
  const blocked = b2bPreviewWriteBlocked();
  if (blocked) return NextResponse.json(blocked, { status: 403 });

  const ctx = await requireB2BCompany();
  if (!isCompanyCtx(ctx)) return ctx;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
  };
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const name = String(body.name || '').trim() || email.split('@')[0];
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  try {
    const existingCount = await db.user.count({
      where: { companyId: ctx.companyId },
    });
    const cap = seatCapForPlan(ctx.company.plan);
    if (existingCount >= cap) {
      return NextResponse.json(
        {
          error: `Seat limit reached (${cap}) for plan ${ctx.company.plan}. Request a demo to upgrade.`,
          code: 'SEAT_CAP',
        },
        { status: 402 },
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.companyId === ctx.companyId) {
        return NextResponse.json({ error: 'Already on this team' }, { status: 409 });
      }
      return NextResponse.json(
        { error: 'Email already registered to another account' },
        { status: 409 },
      );
    }

    const password =
      body.password?.trim() || `Welcome-${randomBytes(4).toString('hex')}!`;
    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash: await hash(password, 12),
        role: 'COMPANY_ADMIN',
        accountType: 'B2B',
        companyId: ctx.companyId,
        language: 'AR',
      },
    });

    return NextResponse.json({
      member: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        joinedAt: user.createdAt.toISOString(),
      },
      tempPassword: body.password?.trim() ? undefined : password,
    });
  } catch (err) {
    console.error('[api/b2b/team POST]', err);
    return NextResponse.json({ error: 'Invite failed' }, { status: 500 });
  }
}
