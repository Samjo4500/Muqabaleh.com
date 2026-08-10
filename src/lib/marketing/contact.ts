/**
 * First-party marketing contact capture for Muqabaleh.
 * Never throws to callers — signup/apply flows must not fail if CRM write fails.
 */

import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import type { Prisma } from '@prisma/client';

export type MarketingSource =
  | 'REGISTER'
  | 'NEWSLETTER'
  | 'TALENT'
  | 'DEMO'
  | 'PARTNER'
  | 'INTERVIEWER'
  | 'OPT_IN'
  | 'PROFILE'
  | 'PREQUAL'
  | 'APPLY'
  | 'SUPPORT'
  | 'OTHER';

export type MarketingCaptureInput = {
  email: string;
  userId?: string | null;
  name?: string | null;
  phone?: string | null;
  country?: string | null;
  location?: string | null;
  industry?: string | null;
  experience?: string | null;
  role?: string | null;
  level?: string | null;
  linkedInUrl?: string | null;
  locale?: string | null;
  source: MarketingSource;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  landingPath?: string | null;
  referrer?: string | null;
  /** Default true for account/newsletter flows that show an explicit consent checkbox. */
  marketingOptIn?: boolean;
  meta?: Record<string, unknown>;
};

let ensured = false;

export async function ensureMarketingContactTable(): Promise<void> {
  if (ensured) return;
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "marketing_contacts" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "userId" TEXT,
        "name" TEXT,
        "phone" TEXT,
        "country" TEXT,
        "location" TEXT,
        "industry" TEXT,
        "experience" TEXT,
        "role" TEXT,
        "level" TEXT,
        "linkedInUrl" TEXT,
        "locale" TEXT,
        "source" TEXT NOT NULL,
        "utmSource" TEXT,
        "utmMedium" TEXT,
        "utmCampaign" TEXT,
        "utmContent" TEXT,
        "utmTerm" TEXT,
        "landingPath" TEXT,
        "referrer" TEXT,
        "marketingOptIn" BOOLEAN NOT NULL DEFAULT true,
        "marketingOptInAt" TIMESTAMP(3),
        "unsubscribedAt" TIMESTAMP(3),
        "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "meta" JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "marketing_contacts_pkey" PRIMARY KEY ("id")
      )
    `);
    await db.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "marketing_contacts_email_key" ON "marketing_contacts"("email")`,
    );
    await db.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "marketing_contacts_userId_key" ON "marketing_contacts"("userId")`,
    );
    ensured = true;
  } catch (err) {
    console.error('[marketing] ensure table', err);
  }
}

function clean(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

function normalizeEmail(email: string): string | null {
  const e = email.trim().toLowerCase();
  if (!e || !e.includes('@') || e.length > 254) return null;
  return e;
}

function mergeMeta(
  prev: unknown,
  next: Record<string, unknown> | undefined,
  source: string,
): Prisma.InputJsonValue {
  const base =
    prev && typeof prev === 'object' && !Array.isArray(prev)
      ? ({ ...(prev as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  const sources = Array.isArray(base.sources) ? [...(base.sources as string[])] : [];
  if (!sources.includes(source)) sources.push(source);
  return { ...base, ...(next || {}), sources, lastSource: source } as Prisma.InputJsonValue;
}

/** Upsert a marketing contact. Safe to fire-and-forget. */
export async function captureMarketingContact(
  input: MarketingCaptureInput,
): Promise<{ ok: boolean; id?: string }> {
  try {
    const email = normalizeEmail(input.email);
    if (!email) return { ok: false };

    await ensureMarketingContactTable();

    const marketingOptIn = input.marketingOptIn !== false;
    const now = new Date();
    const name = clean(input.name);
    const phone = clean(input.phone);
    const country = clean(input.country);
    const location = clean(input.location);
    const industry = clean(input.industry);
    const experience = clean(input.experience);
    const role = clean(input.role);
    const level = clean(input.level);
    const linkedInUrl = clean(input.linkedInUrl);
    const locale = clean(input.locale);
    const utmSource = clean(input.utmSource);
    const utmMedium = clean(input.utmMedium);
    const utmCampaign = clean(input.utmCampaign);
    const utmContent = clean(input.utmContent);
    const utmTerm = clean(input.utmTerm);
    const landingPath = clean(input.landingPath);
    const referrer = clean(input.referrer);
    const userId = clean(input.userId);

    const existing = await db.marketingContact.findUnique({ where: { email } });

    if (existing) {
      const updated = await db.marketingContact.update({
        where: { email },
        data: {
          ...(userId && !existing.userId ? { userId } : {}),
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
          ...(country ? { country } : {}),
          ...(location ? { location } : {}),
          ...(industry ? { industry } : {}),
          ...(experience ? { experience } : {}),
          ...(role ? { role } : {}),
          ...(level ? { level } : {}),
          ...(linkedInUrl ? { linkedInUrl } : {}),
          ...(locale ? { locale } : {}),
          ...(utmSource && !existing.utmSource ? { utmSource } : {}),
          ...(utmMedium && !existing.utmMedium ? { utmMedium } : {}),
          ...(utmCampaign && !existing.utmCampaign ? { utmCampaign } : {}),
          ...(utmContent && !existing.utmContent ? { utmContent } : {}),
          ...(utmTerm && !existing.utmTerm ? { utmTerm } : {}),
          ...(landingPath && !existing.landingPath ? { landingPath } : {}),
          ...(referrer && !existing.referrer ? { referrer } : {}),
          source: existing.source || input.source,
          marketingOptIn: marketingOptIn
            ? true
            : input.marketingOptIn === false
              ? false
              : existing.marketingOptIn,
          marketingOptInAt: marketingOptIn
            ? existing.marketingOptInAt || now
            : input.marketingOptIn === false
              ? null
              : existing.marketingOptInAt,
          unsubscribedAt:
            input.marketingOptIn === false ? now : marketingOptIn ? null : existing.unsubscribedAt,
          lastSeenAt: now,
          meta: mergeMeta(existing.meta, input.meta, input.source),
        },
      });
      void syncBrevoContact(updated).catch(() => {});
      return { ok: true, id: updated.id };
    }

    const created = await db.marketingContact.create({
      data: {
        id: `mc_${randomBytes(12).toString('hex')}`,
        email,
        userId: userId || null,
        name,
        phone,
        country,
        location,
        industry,
        experience,
        role,
        level,
        linkedInUrl,
        locale,
        source: input.source,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        landingPath,
        referrer,
        marketingOptIn,
        marketingOptInAt: marketingOptIn ? now : null,
        unsubscribedAt: marketingOptIn ? null : now,
        lastSeenAt: now,
        meta: mergeMeta({}, input.meta, input.source),
      },
    });
    void syncBrevoContact(created).catch(() => {});
    return { ok: true, id: created.id };
  } catch (err) {
    console.error('[marketing] capture failed', err);
    return { ok: false };
  }
}

async function syncBrevoContact(contact: {
  email: string;
  name: string | null;
  phone: string | null;
  country: string | null;
  role: string | null;
  marketingOptIn: boolean;
  locale: string | null;
  source: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey || !contact.marketingOptIn) return;

  const listIdRaw = process.env.BREVO_MARKETING_LIST_ID?.trim();
  const listIds = listIdRaw ? [Number(listIdRaw)].filter((n) => Number.isFinite(n)) : [];

  const firstName = contact.name?.split(/\s+/)[0] || undefined;
  const lastName = contact.name?.split(/\s+/).slice(1).join(' ') || undefined;

  await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: contact.email,
      updateEnabled: true,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        SMS: contact.phone || undefined,
        COUNTRY: contact.country || undefined,
        ROLE: contact.role || undefined,
        LOCALE: contact.locale || undefined,
        SOURCE: contact.source,
      },
      ...(listIds.length ? { listIds } : {}),
    }),
  }).catch(() => {});
}

export function attributionFromBody(body: Record<string, unknown> | null | undefined) {
  if (!body) return {};
  return {
    utmSource: clean(body.utmSource ?? body.utm_source),
    utmMedium: clean(body.utmMedium ?? body.utm_medium),
    utmCampaign: clean(body.utmCampaign ?? body.utm_campaign),
    utmContent: clean(body.utmContent ?? body.utm_content),
    utmTerm: clean(body.utmTerm ?? body.utm_term),
    landingPath: clean(body.landingPath ?? body.landing_path),
    referrer: clean(body.referrer),
    locale: clean(body.locale),
  };
}
