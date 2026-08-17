import { db } from '@/lib/db';
import {
  addDaysAtNine,
  canSendNurture,
  nextMondayAtNine,
  shouldSkipJobClick,
  shouldSkipSignupStep,
  skipForLessOften,
} from './schedule';
import { buildMergeForLead } from './leads';
import {
  NURTURE_REPLY_TO,
  NURTURE_SENDER,
  renderNurtureEmail,
} from './templates';
import { sendBrevoEmail } from '@/lib/brevo';

const BATCH = 12;

function nextAfterSend(
  sequence: string,
  step: number,
  timezone: string,
  from = new Date(),
): { step: number; nextSendAt: Date | null; status: string } {
  if (sequence === 'NEW_SIGNUP') {
    if (step >= 5) return { step, nextSendAt: null, status: 'COMPLETED' };
    const gap: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 3 };
    return {
      step: step + 1,
      nextSendAt: addDaysAtNine(from, gap[step] ?? 3, timezone),
      status: 'ACTIVE',
    };
  }
  if (sequence === 'ACTIVE_PRACTICERS') {
    if (step >= 3) return { step, nextSendAt: null, status: 'COMPLETED' };
    const gap = step === 1 ? 2 : 4;
    return {
      step: step + 1,
      nextSendAt: addDaysAtNine(from, gap, timezone),
      status: 'ACTIVE',
    };
  }
  if (sequence === 'JOB_SEEKERS') {
    return {
      step: 1,
      nextSendAt: nextMondayAtNine(new Date(from.getTime() + 24 * 60 * 60 * 1000), timezone),
      status: 'ACTIVE',
    };
  }
  return { step, nextSendAt: null, status: 'COMPLETED' };
}

async function markOpenStreak(leadId: string, lastEmailOpenAt: Date | null, lastSentAt: Date | null) {
  if (lastSentAt && (!lastEmailOpenAt || lastEmailOpenAt < lastSentAt)) {
    const lead = await db.nurtureLead.update({
      where: { id: leadId },
      data: { consecutiveNoOpens: { increment: 1 } },
      select: { consecutiveNoOpens: true },
    });
    if (lead.consecutiveNoOpens >= 3) {
      await db.nurturePreference.updateMany({
        where: { leadId, frequency: { not: 'UNSUBSCRIBED' } },
        data: { frequency: 'MONTHLY_DIGEST' },
      });
      await db.nurtureEnrollment.updateMany({
        where: { leadId, sequence: { in: ['NEW_SIGNUP', 'ACTIVE_PRACTICERS'] }, status: 'ACTIVE' },
        data: { status: 'PAUSED' },
      });
    }
  } else if (lastEmailOpenAt && lastSentAt && lastEmailOpenAt >= lastSentAt) {
    await db.nurtureLead.update({
      where: { id: leadId },
      data: { consecutiveNoOpens: 0 },
    });
  }
}

export async function processNurtureQueue(): Promise<{
  sent: number;
  skipped: number;
  failed: number;
}> {
  const due = await db.nurtureEnrollment.findMany({
    where: {
      status: 'ACTIVE',
      nextSendAt: { lte: new Date() },
    },
    include: {
      lead: { include: { preference: true } },
    },
    orderBy: { nextSendAt: 'asc' },
    take: BATCH,
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const enrollment of due) {
    const claimed = await db.nurtureEnrollment.updateMany({
      where: {
        id: enrollment.id,
        status: 'ACTIVE',
        nextSendAt: { lte: new Date() },
      },
      data: { nextSendAt: new Date(Date.now() + 15 * 60 * 1000) },
    });
    if (claimed.count !== 1) {
      skipped++;
      continue;
    }

    const lead = enrollment.lead;
    const pref = lead.preference;
    const gate = canSendNurture(pref);
    if (!gate.ok) {
      if (gate.reason === 'unsubscribed') {
        await db.nurtureEnrollment.update({
          where: { id: enrollment.id },
          data: { status: 'PAUSED' },
        });
      } else if (gate.reason === 'monthly_digest' && enrollment.sequence !== 'JOB_SEEKERS') {
        await db.nurtureEnrollment.update({
          where: { id: enrollment.id },
          data: { status: 'PAUSED' },
        });
      } else {
        await db.nurtureEnrollment.update({
          where: { id: enrollment.id },
          data: { nextSendAt: addDaysAtNine(new Date(), 1, lead.timezone) },
        });
      }
      skipped++;
      continue;
    }

    if (skipForLessOften(pref?.frequency || 'NORMAL', enrollment.step)) {
      const nxt = nextAfterSend(enrollment.sequence, enrollment.step, lead.timezone);
      await db.nurtureEnrollment.update({
        where: { id: enrollment.id },
        data: {
          step: nxt.step,
          nextSendAt: nxt.nextSendAt,
          status: nxt.status,
        },
      });
      skipped++;
      continue;
    }

    if (
      enrollment.sequence === 'NEW_SIGNUP' &&
      shouldSkipSignupStep(enrollment.step, lead)
    ) {
      const nxt = nextAfterSend(enrollment.sequence, enrollment.step, lead.timezone);
      await db.nurtureEnrollment.update({
        where: { id: enrollment.id },
        data: {
          step: nxt.step,
          nextSendAt: nxt.nextSendAt,
          status: nxt.status,
        },
      });
      skipped++;
      continue;
    }

    if (enrollment.sequence === 'JOB_CLICK' && shouldSkipJobClick(lead)) {
      await db.nurtureEnrollment.update({
        where: { id: enrollment.id },
        data: { status: 'SKIPPED' },
      });
      skipped++;
      continue;
    }

    const token = pref?.token;
    if (!token) {
      skipped++;
      continue;
    }

    await markOpenStreak(lead.id, lead.lastEmailOpenAt, lead.lastEmailSentAt);

    const merge = await buildMergeForLead(lead, token, enrollment.id);
    const rendered = renderNurtureEmail({
      sequence: enrollment.sequence,
      step: enrollment.step,
      merge,
    });
    if (!rendered) {
      await db.nurtureEnrollment.update({
        where: { id: enrollment.id },
        data: { status: 'COMPLETED' },
      });
      skipped++;
      continue;
    }

    const result = await sendBrevoEmail({
      to: lead.email,
      subject: rendered.subject,
      html: rendered.html,
      sender: NURTURE_SENDER,
      replyTo: NURTURE_REPLY_TO,
    });

    if (!result.success) {
      await db.nurtureEnrollment.update({
        where: { id: enrollment.id },
        data: { nextSendAt: hoursLater(1) },
      });
      failed++;
      continue;
    }

    const nxt = nextAfterSend(enrollment.sequence, enrollment.step, lead.timezone);
    await db.nurtureEnrollment.update({
      where: { id: enrollment.id },
      data: {
        lastSentAt: new Date(),
        step: nxt.step,
        nextSendAt: nxt.nextSendAt,
        status: nxt.status,
      },
    });
    await db.nurtureLead.update({
      where: { id: lead.id },
      data: { lastEmailSentAt: new Date() },
    });
    sent++;
  }

  return { sent, skipped, failed };
}

function hoursLater(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function recordEmailOpen(token: string, enrollmentId?: string | null) {
  const pref = await db.nurturePreference.findUnique({
    where: { token },
    select: { leadId: true },
  });
  if (!pref) return false;
  await db.nurtureLead.update({
    where: { id: pref.leadId },
    data: { lastEmailOpenAt: new Date(), consecutiveNoOpens: 0 },
  });
  await db.nurtureEvent.create({
    data: {
      leadId: pref.leadId,
      kind: 'email_open',
      metadata: JSON.stringify({ enrollmentId: enrollmentId || null }),
    },
  });
  return true;
}
