import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enforceIpRateLimit } from '@/lib/rate-limit';
import { normalizeEmail, normalizeOptional } from '@/lib/nurture/validate';
import {
  afterApplyClick,
  afterJobClick,
  afterJobsBrowse,
  recordNurtureEvent,
} from '@/lib/nurture/leads';

const KINDS = new Set([
  'jobs_browse',
  'job_click',
  'apply_click',
  'practice_start',
]);

export async function POST(req: NextRequest) {
  const blocked = await enforceIpRateLimit('nurture-collect', 60);
  if (blocked) return blocked;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const kind = String(body.kind || '');
  if (!KINDS.has(kind)) {
    return NextResponse.json({ error: 'unknown_kind' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const token = typeof body.token === 'string' ? body.token : '';
  let lead = email
    ? await db.nurtureLead.findUnique({
        where: { email },
        include: { preference: true },
      })
    : null;
  if (!lead && token) {
    const pref = await db.nurturePreference.findUnique({
      where: { token },
      include: { lead: { include: { preference: true } } },
    });
    lead = pref?.lead ?? null;
  }

  await recordNurtureEvent({
    leadId: lead?.id,
    email: lead?.email || email,
    kind,
    path: normalizeOptional(body.path, 240),
    metadata: {
      role: body.role,
      company: body.company,
      jobId: body.jobId,
    },
  });

  if (lead) {
    const meta = {
      role: normalizeOptional(body.role, 160) || undefined,
      company: normalizeOptional(body.company, 120) || undefined,
      jobId: normalizeOptional(body.jobId, 80) || undefined,
    };
    if (kind === 'jobs_browse') await afterJobsBrowse(lead.id, lead.timezone);
    if (kind === 'job_click') await afterJobClick(lead.id, lead.timezone, meta);
    if (kind === 'apply_click') await afterApplyClick(lead.id, lead.timezone, meta);
  }

  return NextResponse.json({ ok: true });
}
