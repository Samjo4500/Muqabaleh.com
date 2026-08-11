import { NextRequest, NextResponse } from 'next/server';
import { forbidUnless, isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { createJob, listJobs } from '@/lib/console/service';
import type { InterviewQuestion, JobBranding } from '@/lib/console/types';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'view_passports');
  if (denied) return denied;

  const jobs = await listJobs(auth);
  return NextResponse.json({ ok: true, jobs, tenantId: auth.organizationId });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'manage_jobs');
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    titleAr?: string;
    roleKey?: string;
    difficulty?: string;
    language?: string;
    questions?: InterviewQuestion[];
    branding?: JobBranding;
    expiresAt?: string | null;
    maxAttempts?: number;
    status?: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }

  const job = await createJob(auth, {
    title: body.title.trim(),
    titleAr: body.titleAr,
    roleKey: body.roleKey,
    difficulty: body.difficulty,
    language: body.language,
    questions: body.questions,
    branding: body.branding,
    expiresAt: body.expiresAt,
    maxAttempts: body.maxAttempts,
    status: body.status,
  });

  return NextResponse.json({ ok: true, job }, { status: 201 });
}
