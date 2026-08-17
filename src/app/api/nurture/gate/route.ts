import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enforceIpRateLimit } from '@/lib/rate-limit';
import {
  normalizeCity,
  normalizeEmail,
  normalizeExperience,
  normalizeLanguage,
  normalizeName,
  normalizeOptional,
} from '@/lib/nurture/validate';
import {
  afterGate1,
  afterGate2,
  afterPracticeComplete,
  recordNurtureEvent,
  sendNurtureNow,
  upsertNurtureLead,
} from '@/lib/nurture/leads';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const blocked = await enforceIpRateLimit('nurture-gate', 20);
  if (blocked) return blocked;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const action = String(body.action || 'gate1');
  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user && 'id' in session.user ? String(session.user.id) : null;

  if (action === 'save_role') {
    const name = normalizeName(body.fullName) || email.split('@')[0];
    const lead = await upsertNurtureLead({
      email,
      fullName: name,
      currentCity: normalizeCity(body.currentCity),
      source: 'SAVE_ROLE',
      userId,
      role: normalizeOptional(body.role, 160),
      jobCompany: normalizeOptional(body.company, 120),
      jobId: normalizeOptional(body.jobId, 80),
      tags: ['Job Intent'],
    });
    await db.nurtureSavedRole.create({
      data: {
        leadId: lead.id,
        company: normalizeOptional(body.company, 120),
        role: normalizeOptional(body.role, 160),
        jobId: normalizeOptional(body.jobId, 80),
        href: normalizeOptional(body.href, 240),
      },
    });
    await recordNurtureEvent({
      leadId: lead.id,
      email,
      kind: 'save_role',
      metadata: { role: body.role, company: body.company },
    });
    return NextResponse.json({ ok: true, saved: true, token: lead.preference?.token });
  }

  const fullName = normalizeName(body.fullName);
  const currentCity = normalizeCity(body.currentCity);
  if (!fullName || !currentCity) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  if (action === 'gate2') {
    const yearsExperience = normalizeExperience(body.yearsExperience);
    const preferredLanguage = normalizeLanguage(body.preferredLanguage);
    if (!yearsExperience || !preferredLanguage) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }
    const lead = await upsertNurtureLead({
      email,
      fullName,
      currentCity,
      yearsExperience,
      preferredLanguage,
      source: 'GATE2',
      userId,
      role: normalizeOptional(body.role, 160),
      jobCompany: normalizeOptional(body.company, 120),
      jobId: normalizeOptional(body.jobId, 80),
      tags: ['Job Intent'],
    });
    await afterGate2(lead.id, lead.timezone);
    await recordNurtureEvent({
      leadId: lead.id,
      email,
      kind: 'practice_start',
      metadata: { role: body.role, company: body.company },
    });
    return NextResponse.json({
      ok: true,
      unlocked: false,
      practiceReady: true,
      token: lead.preference?.token,
      email,
      fullName,
    });
  }

  const strengths = Array.isArray(body.strengths)
    ? body.strengths.map((s) => String(s)).slice(0, 3)
    : [];
  const improvements = Array.isArray(body.improvements)
    ? body.improvements.map((s) => String(s)).slice(0, 3)
    : [];
  const competencies =
    body.competencies && typeof body.competencies === 'object'
      ? (body.competencies as Record<string, number>)
      : {};
  const overallScore = Number(body.overallScore);
  const lead = await upsertNurtureLead({
    email,
    fullName,
    currentCity,
    company: normalizeOptional(body.company, 160),
    phone: normalizeOptional(body.phone, 40),
    source: 'GATE1',
    userId,
    role: normalizeOptional(body.role, 160),
    jobCompany: normalizeOptional(body.jobCompany, 120),
    incrementPractice: true,
    tags: body.jobIntent ? ['Job Intent'] : [],
    score: {
      overallScore: Number.isFinite(overallScore) ? overallScore : undefined,
      strengths,
      improvements,
      competencies,
    },
  });

  const enrollment = await afterGate1(lead.id, lead.timezone);
  await afterPracticeComplete(lead);
  await recordNurtureEvent({
    leadId: lead.id,
    email,
    kind: 'practice_complete',
    metadata: { overallScore },
  });

  if (lead.preference?.token && !enrollment.lastSentAt) {
    const sent = await sendNurtureNow({
      sequence: 'NEW_SIGNUP',
      step: 1,
      lead,
      token: lead.preference.token,
      enrollmentId: enrollment.id,
    });
    if (sent.success) {
      await db.nurtureEnrollment.update({
        where: { id: enrollment.id },
        data: { lastSentAt: new Date() },
      });
      await db.nurtureLead.update({
        where: { id: lead.id },
        data: { lastEmailSentAt: new Date() },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    unlocked: true,
    token: lead.preference?.token,
    email,
    fullName,
  });
}
