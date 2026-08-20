import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { sendBrevoEmail, brandedEmailShell } from '@/lib/brevo';
import { MUQABALEH_BRAND, localePath } from '@/lib/brand/comms';
import { writeAdminNotification } from '@/lib/admin/notify';
import {
  STUDENT100_CAP,
  STUDENT100_CREDITS,
  STUDENT100_RESERVED_STATUSES,
  STUDENT100_START_AT,
  isCampaignOpen,
  packExpiresAt,
  remainingFromReserved,
} from './constants';
import {
  isAcademicEmail,
  isMissingRelationError,
  normalizeCountry,
  normalizeEligibility,
  normalizeEmail,
  normalizeText,
} from './eligibility';
import type { Student100Mine, Student100PublicStatus } from './types';
import { expireStudent100Pack } from './credits';
import { student100AdminNotification } from './admin-inbox';

export type { Student100Mine, Student100PublicStatus };
export { consumeStudent100Credit, expireStudent100Pack } from './credits';

const EMPTY_STATUS: Student100PublicStatus = {
  available: false,
  open: isCampaignOpen(),
  startAt: STUDENT100_START_AT.toISOString(),
  cap: STUDENT100_CAP,
  reserved: 0,
  remaining: STUDENT100_CAP,
  soldOut: false,
};

export async function getStudent100Status(): Promise<Student100PublicStatus> {
  try {
    const reserved = await db.student100Claim.count({
      where: { status: { in: [...STUDENT100_RESERVED_STATUSES] } },
    });
    const remaining = remainingFromReserved(reserved);
    return {
      available: true,
      open: isCampaignOpen(),
      startAt: STUDENT100_START_AT.toISOString(),
      cap: STUDENT100_CAP,
      reserved,
      remaining,
      soldOut: remaining === 0,
    };
  } catch (err) {
    if (isMissingRelationError(err)) return EMPTY_STATUS;
    console.error('getStudent100Status', err);
    return EMPTY_STATUS;
  }
}

export async function getMyStudent100Claim(userId: string): Promise<Student100Mine> {
  try {
    await expireStudent100Pack(userId);
    const row = await db.student100Claim.findUnique({
      where: { userId },
      select: { status: true, creditsRemaining: true, expiresAt: true },
    });
    if (!row) return null;
    return {
      status: row.status,
      creditsRemaining: row.creditsRemaining,
      expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    };
  } catch (err) {
    if (isMissingRelationError(err)) return null;
    console.error('getMyStudent100Claim', err);
    return null;
  }
}

type ApplyInput = {
  userId: string;
  accountEmail: string;
  fullName: unknown;
  country: unknown;
  university: unknown;
  major: unknown;
  eligibility: unknown;
  universityEmail: unknown;
  proofNote: unknown;
  locale: 'ar' | 'en';
};

export type ApplyResult =
  | { ok: true; status: 'ACTIVATED' | 'PENDING' }
  | { ok: false; error: string; code: string; status: number };

export async function applyStudent100(input: ApplyInput): Promise<ApplyResult> {
  if (!isCampaignOpen()) {
    return { ok: false, error: 'Campaign has not started', code: 'not_open', status: 400 };
  }

  const fullName = normalizeText(input.fullName, 2, 120);
  const country = normalizeCountry(input.country);
  const university = normalizeText(input.university, 2, 160);
  const major = normalizeText(input.major, 2, 160);
  const eligibility = normalizeEligibility(input.eligibility);
  const uniEmail = normalizeEmail(input.universityEmail);
  const proof = normalizeText(input.proofNote, 0, 400);
  const accountEmail = normalizeEmail(input.accountEmail);

  if (!fullName || !country || !university || !major || !eligibility || !accountEmail) {
    return { ok: false, error: 'Missing required fields', code: 'invalid', status: 400 };
  }

  const verifyEmail = uniEmail || accountEmail;
  const academic = isAcademicEmail(verifyEmail);
  if (!academic && !proof) {
    return {
      ok: false,
      error: 'University email or a short proof note is required',
      code: 'need_proof',
      status: 400,
    };
  }

  try {
    const existing = await db.student100Claim.findFirst({
      where: { OR: [{ userId: input.userId }, { email: accountEmail }] },
      select: { id: true, status: true },
    });
    if (existing) {
      return { ok: false, error: 'Already applied', code: 'already', status: 409 };
    }

    const created = await db.$transaction(async (tx) => {
      const reserved = await tx.student100Claim.count({
        where: { status: { in: [...STUDENT100_RESERVED_STATUSES] } },
      });
      if (reserved >= STUDENT100_CAP) {
        throw new Error('SOLD_OUT');
      }
      return tx.student100Claim.create({
        data: {
          userId: input.userId,
          email: accountEmail,
          fullName,
          country,
          university,
          major,
          eligibility,
          universityEmail: uniEmail,
          proofNote: proof || null,
          status: 'PENDING',
        },
      });
    });

    if (academic) {
      const activated = await activateStudent100Claim(created.id, input.locale);
      const status = activated.ok ? 'ACTIVATED' : 'PENDING';
      void notifyStudent100Inbox({
        id: created.id,
        name: fullName,
        email: accountEmail,
        university,
        country,
        status,
        proofNote: proof,
      });
      if (activated.ok) return { ok: true, status: 'ACTIVATED' };
      return { ok: true, status: 'PENDING' };
    }

    void notifyStudent100Pending(accountEmail, fullName, input.locale);
    void notifyStudent100Inbox({
      id: created.id,
      name: fullName,
      email: accountEmail,
      university,
      country,
      status: 'PENDING',
      proofNote: proof,
    });
    return { ok: true, status: 'PENDING' };
  } catch (err) {
    if (err instanceof Error && err.message === 'SOLD_OUT') {
      return { ok: false, error: 'All packs claimed', code: 'sold_out', status: 409 };
    }
    if (isMissingRelationError(err)) {
      return { ok: false, error: 'Campaign store not ready', code: 'unavailable', status: 503 };
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { ok: false, error: 'Already applied', code: 'already', status: 409 };
    }
    console.error('applyStudent100', err);
    return { ok: false, error: 'Could not apply', code: 'error', status: 500 };
  }
}

export async function activateStudent100Claim(
  claimId: string,
  locale: 'ar' | 'en' = 'en',
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const claim = await db.student100Claim.findUnique({ where: { id: claimId } });
    if (!claim) return { ok: false, error: 'Not found' };
    if (claim.status === 'ACTIVATED') return { ok: true };
    if (claim.status === 'REJECTED' || claim.status === 'EXPIRED') {
      return { ok: false, error: `Cannot activate ${claim.status}` };
    }

    const reserved = await db.student100Claim.count({
      where: { status: 'ACTIVATED' },
    });
    if (reserved >= STUDENT100_CAP) {
      return { ok: false, error: 'Cap reached' };
    }

    const now = new Date();
    const expiresAt = packExpiresAt(now);

    await db.$transaction([
      db.student100Claim.update({
        where: { id: claim.id },
        data: {
          status: 'ACTIVATED',
          creditsGranted: STUDENT100_CREDITS,
          creditsRemaining: STUDENT100_CREDITS,
          activatedAt: now,
          expiresAt,
        },
      }),
      db.user.update({
        where: { id: claim.userId },
        data: { sessionsLeft: { increment: STUDENT100_CREDITS } },
      }),
    ]);

    void notifyStudent100Activated(claim.email, claim.fullName, locale, expiresAt);
    return { ok: true };
  } catch (err) {
    if (isMissingRelationError(err)) return { ok: false, error: 'unavailable' };
    console.error('activateStudent100Claim', err);
    return { ok: false, error: 'activate_failed' };
  }
}

export async function rejectStudent100Claim(claimId: string): Promise<{ ok: boolean }> {
  try {
    await db.student100Claim.updateMany({
      where: { id: claimId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });
    return { ok: true };
  } catch (err) {
    if (isMissingRelationError(err)) return { ok: false };
    console.error('rejectStudent100Claim', err);
    return { ok: false };
  }
}

export async function countStudent100Pending(): Promise<number> {
  try {
    return await db.student100Claim.count({ where: { status: 'PENDING' } });
  } catch (err) {
    if (isMissingRelationError(err)) return 0;
    console.error('countStudent100Pending', err);
    return 0;
  }
}

export async function listStudent100Claims() {
  return db.student100Claim.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      email: true,
      fullName: true,
      country: true,
      university: true,
      major: true,
      eligibility: true,
      universityEmail: true,
      proofNote: true,
      status: true,
      creditsRemaining: true,
      expiresAt: true,
      createdAt: true,
      userId: true,
    },
  });
}

async function notifyStudent100Activated(
  email: string,
  name: string,
  locale: 'ar' | 'en',
  expiresAt: Date,
) {
  const isAr = locale === 'ar';
  const html = brandedEmailShell({
    locale,
    eyebrow: isAr ? 'باقة الطلاب' : 'Student Interview Pack',
    title: isAr ? `تم التفعيل، ${name}` : `Pack activated, ${name}`,
    bodyHtml: isAr
      ? `<p style="margin:0 0 12px;">حصلت على <strong>3 مقابلات تجريبية</strong> صالحة 30 يوماً. ليست اشتراك جيني برو.</p>
         <p style="margin:0;color:#64748b;font-size:14px;">تنتهي في ${expiresAt.toISOString().slice(0, 10)}.</p>`
      : `<p style="margin:0 0 12px;">You now have <strong>3 mock interviews</strong>, valid for 30 days. This is not a Jeannie Pro subscription.</p>
         <p style="margin:0;color:#64748b;font-size:14px;">Expires ${expiresAt.toISOString().slice(0, 10)}.</p>`,
    ctaHref: localePath('/interview/prep', locale),
    ctaLabel: isAr ? 'ابدأ التدرّب' : 'Start practicing',
  });
  await sendBrevoEmail({
    to: email,
    subject: isAr ? 'تم تفعيل باقة مقابلة للطلاب' : 'Your Muqabaleh Student Interview Pack is active',
    html,
    sender: MUQABALEH_BRAND.senders.system,
  }).catch(() => undefined);
}

async function notifyStudent100Pending(email: string, name: string, locale: 'ar' | 'en') {
  const isAr = locale === 'ar';
  const html = brandedEmailShell({
    locale,
    eyebrow: isAr ? 'باقة الطلاب' : 'Student 100',
    title: isAr ? `استلمنا طلبك، ${name}` : `We received your application, ${name}`,
    bodyHtml: isAr
      ? `<p style="margin:0;">إذا كنت مؤهلاً ومن أوائل 100 بعد التحقق، ستظهر الباقة في حسابك أو يصلك بريد الخطوة التالية. لا تشارك وثائق شخصية في الردود العامة.</p>`
      : `<p style="margin:0;">If you are eligible and one of the first 100 verified applicants, the Interview Pack will appear in your account or you will receive the next-step email. Please do not share personal documents in public replies.</p>`,
  });
  await sendBrevoEmail({
    to: email,
    subject: isAr ? 'طلب باقة الطلاب 100' : 'Student 100 application received',
    html,
    sender: MUQABALEH_BRAND.senders.system,
  }).catch(() => undefined);
}

async function notifyStudent100Inbox(input: {
  id: string;
  name: string;
  email: string;
  university: string;
  country: string;
  status: 'PENDING' | 'ACTIVATED';
  proofNote?: string | null;
}) {
  const payload = student100AdminNotification(input);
  await writeAdminNotification({
    channel: payload.channel,
    subject: payload.subject,
    body: payload.body,
    href: payload.href,
    kind: payload.kind,
    severity: payload.severity,
    meta: payload.meta,
  });
  if (input.status !== 'PENDING') return;
  const to = process.env.ADMIN_EMAIL?.trim() || MUQABALEH_BRAND.supportEmail;
  await sendBrevoEmail({
    to,
    subject: payload.subject,
    html: `<p>${payload.body}</p><p>Open Super Admin → Student 100 Contact Center.</p>`,
    sender: MUQABALEH_BRAND.senders.system,
  }).catch(() => undefined);
}
