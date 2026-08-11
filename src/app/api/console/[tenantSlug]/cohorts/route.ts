import { NextRequest, NextResponse } from 'next/server';
import {
  forbidUnless,
  isConsoleCtx,
  requireConsoleTenant,
  requireTenantType,
} from '@/lib/console/auth';
import { importCohortCsv, listCohorts, setStudentShare } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const wrong = requireTenantType(auth, ['ACADEMY']);
  if (wrong) return wrong;

  const cohorts = await listCohorts(auth);
  return NextResponse.json({ ok: true, cohorts, tenantId: auth.organizationId });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const wrong = requireTenantType(auth, ['ACADEMY']);
  if (wrong) return wrong;
  const denied = forbidUnless(auth, 'manage_jobs');
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    name?: string;
    major?: string;
    year?: string;
    facultyEmail?: string;
    deadline?: string;
    students?: {
      name: string;
      email: string;
      studentId: string;
      major?: string;
      year?: string;
    }[];
    cohortId?: string;
    studentId?: string;
    share?: boolean;
  };

  if (body.action === 'share' && body.cohortId && body.studentId != null) {
    const student = await setStudentShare(
      auth,
      body.cohortId,
      body.studentId,
      Boolean(body.share),
    );
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, student });
  }

  if (!body.name || !body.major || !body.year || !body.students?.length) {
    return NextResponse.json({ error: 'Invalid cohort payload' }, { status: 400 });
  }

  const cohort = await importCohortCsv(auth, {
    name: body.name,
    major: body.major,
    year: body.year,
    facultyEmail: body.facultyEmail,
    deadline: body.deadline,
    students: body.students.map((s) => ({
      name: s.name,
      email: s.email,
      studentId: s.studentId,
      major: s.major || body.major!,
      year: s.year || body.year!,
    })),
  });

  return NextResponse.json({ ok: true, cohort }, { status: 201 });
}
