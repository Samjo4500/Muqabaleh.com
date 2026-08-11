import { NextRequest, NextResponse } from 'next/server';
import { forbidUnless, isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { listJobs, updateJob } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string; id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug, id } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;

  const jobs = await listJobs(auth);
  const job = jobs.find((j) => j.id === id);
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, job });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { tenantSlug, id } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'manage_jobs');
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const job = await updateJob(auth, id, body);
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, job });
}
