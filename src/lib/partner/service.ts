import { createHash, randomBytes } from 'crypto';
import {
  buildDemoDashboard,
  createDemoApiKey,
  demoStore,
  DEMO_PARTNER_ID,
} from './demo-data';
import type {
  PartnerApiKeySafe,
  PartnerClient,
  PartnerDashboard,
  PartnerMember,
  PartnerRecord,
  PartnerWebhookRecord,
} from './types';

function hashKey(raw: string) {
  return createHash('sha256').update(raw).digest('hex');
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || `partner-${randomBytes(3).toString('hex')}`;
}

export async function getPartnerDashboard(
  partnerId: string,
  usingDemo: boolean,
): Promise<PartnerDashboard> {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) return buildDemoDashboard();

  try {
    const { db } = await import('@/lib/db');
    const partner = await db.partner.findUniqueOrThrow({ where: { id: partnerId } });
    const companies = await db.company.findMany({
      where: { partnerId },
      include: { _count: { select: { b2bJobs: true } } },
    });
    const jobs = await db.b2BJob.count({
      where: { company: { partnerId } },
    });
    const interviews30d = await db.interview.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
        OR: [
          { companyId: { in: companies.map((c) => c.id) } },
        ],
      },
    });
    const payouts = await db.partnerPayout.findMany({
      where: {
        partnerId,
        createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
      },
    });

    return {
      partner: partner as unknown as PartnerRecord,
      kpis: {
        clients: companies.filter((c) => c.status === 'ACTIVE').length,
        activeJobs: jobs,
        interviews30d,
        creditsPool: partner.creditsPool,
        earningsCents30d: payouts.reduce((n, p) => n + p.amountCents, 0),
        conversionRate: interviews30d > 0 ? Math.min(0.95, jobs / Math.max(interviews30d, 1)) : 0,
      },
      recentActivity: companies.slice(0, 4).map((c, i) => ({
        id: c.id,
        type: 'client',
        title: `${c.name} — ${c._count.b2bJobs} jobs`,
        titleAr: `${c.name} — ${c._count.b2bJobs} وظائف`,
        at: new Date(Date.now() - i * 86400000).toISOString(),
      })),
      usageSeries: buildDemoDashboard().usageSeries,
    };
  } catch {
    return buildDemoDashboard();
  }
}

export async function updatePartnerBranding(
  partnerId: string,
  usingDemo: boolean,
  data: Partial<PartnerRecord>,
): Promise<PartnerRecord> {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) {
    demoStore.partner = {
      ...demoStore.partner,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return demoStore.partner;
  }

  const { db } = await import('@/lib/db');
  const updated = await db.partner.update({
    where: { id: partnerId },
    data: {
      name: data.name,
      legalName: data.legalName,
      logoUrl: data.logoUrl,
      faviconUrl: data.faviconUrl,
      primaryColor: data.primaryColor,
      accentColor: data.accentColor,
      customDomain: data.customDomain,
      supportEmail: data.supportEmail,
      fromEmailName: data.fromEmailName,
      website: data.website,
      contactPhone: data.contactPhone,
      country: data.country,
    },
  });
  return updated as unknown as PartnerRecord;
}

export async function listClients(
  partnerId: string,
  usingDemo: boolean,
): Promise<PartnerClient[]> {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) return demoStore.clients;

  try {
    const { db } = await import('@/lib/db');
    const companies = await db.company.findMany({
      where: { partnerId },
      include: {
        _count: { select: { b2bJobs: true } },
        b2bJobs: { select: { interviews: { select: { id: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      country: c.country,
      size: c.size,
      plan: c.plan,
      credits: c.credits,
      status: c.status,
      jobsCount: c._count.b2bJobs,
      interviewsCount: c.b2bJobs.reduce((n, j) => n + j.interviews.length, 0),
      createdAt: c.createdAt.toISOString(),
    }));
  } catch {
    return demoStore.clients;
  }
}

export async function createClient(
  partnerId: string,
  usingDemo: boolean,
  input: {
    name: string;
    industry: string;
    country: string;
    size?: string;
    plan?: string;
    credits?: number;
    adminEmail?: string;
    adminName?: string;
    adminPassword?: string;
  },
): Promise<PartnerClient> {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) {
    const client: PartnerClient = {
      id: `client-${randomBytes(4).toString('hex')}`,
      name: input.name,
      industry: input.industry,
      country: input.country,
      size: input.size || 'SMALL',
      plan: input.plan || 'B2B_STARTER',
      credits: input.credits ?? 10,
      status: 'ACTIVE',
      jobsCount: 0,
      interviewsCount: 0,
      createdAt: new Date().toISOString(),
    };
    demoStore.clients = [client, ...demoStore.clients];
    demoStore.partner.creditsPool = Math.max(
      0,
      demoStore.partner.creditsPool - (input.credits ?? 10),
    );
    return client;
  }

  const { db } = await import('@/lib/db');
  const { hash } = await import('bcryptjs');
  const credits = input.credits ?? 10;

  const company = await db.$transaction(async (tx) => {
    const partner = await tx.partner.update({
      where: { id: partnerId },
      data: { creditsPool: { decrement: credits } },
    });
    if (partner.creditsPool < 0) {
      throw new Error('Insufficient partner credits');
    }
    const created = await tx.company.create({
      data: {
        name: input.name,
        industry: input.industry,
        country: input.country,
        size: input.size || 'SMALL',
        plan: input.plan || 'B2B_STARTER',
        credits,
        partnerId,
        status: 'ACTIVE',
      },
    });
    if (input.adminEmail && input.adminPassword) {
      await tx.user.create({
        data: {
          email: input.adminEmail.toLowerCase(),
          name: input.adminName || input.name,
          passwordHash: await hash(input.adminPassword, 12),
          role: 'COMPANY_ADMIN',
          accountType: 'B2B',
          companyId: created.id,
          language: 'AR',
        },
      });
    }
    return created;
  });

  return {
    id: company.id,
    name: company.name,
    industry: company.industry,
    country: company.country,
    size: company.size,
    plan: company.plan,
    credits: company.credits,
    status: company.status,
    jobsCount: 0,
    interviewsCount: 0,
    createdAt: company.createdAt.toISOString(),
  };
}

export async function listMembers(
  partnerId: string,
  usingDemo: boolean,
): Promise<PartnerMember[]> {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) return demoStore.members;
  try {
    const { db } = await import('@/lib/db');
    const users = await db.user.findMany({
      where: {
        partnerId,
        role: { in: ['PARTNER_ADMIN', 'PARTNER_MEMBER'] },
      },
      orderBy: { createdAt: 'asc' },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as PartnerMember['role'],
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt?.toISOString() || null,
    }));
  } catch {
    return demoStore.members;
  }
}

export async function inviteMember(
  partnerId: string,
  usingDemo: boolean,
  input: { name: string; email: string; role: 'PARTNER_ADMIN' | 'PARTNER_MEMBER'; password: string },
): Promise<PartnerMember> {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) {
    const member: PartnerMember = {
      id: `user-${randomBytes(4).toString('hex')}`,
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      isActive: true,
      lastLoginAt: null,
    };
    demoStore.members = [...demoStore.members, member];
    return member;
  }
  const { db } = await import('@/lib/db');
  const { hash } = await import('bcryptjs');
  const user = await db.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: await hash(input.password, 12),
      role: input.role,
      accountType: 'PARTNER',
      partnerId,
      language: 'AR',
    },
  });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as PartnerMember['role'],
    isActive: user.isActive,
    lastLoginAt: null,
  };
}

export async function listApiKeys(
  partnerId: string,
  usingDemo: boolean,
): Promise<PartnerApiKeySafe[]> {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) {
    return demoStore.apiKeys.map(({ plaintext: _p, ...rest }) => rest);
  }
  try {
    const { db } = await import('@/lib/db');
    const keys = await db.partnerApiKey.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });
    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyHint: k.keyHint,
      scopes: k.scopes,
      lastUsedAt: k.lastUsedAt?.toISOString() || null,
      revokedAt: k.revokedAt?.toISOString() || null,
      createdAt: k.createdAt.toISOString(),
    }));
  } catch {
    return demoStore.apiKeys.map(({ plaintext: _p, ...rest }) => rest);
  }
}

export async function createApiKey(
  partnerId: string,
  usingDemo: boolean,
  name: string,
  scopes: string[],
): Promise<PartnerApiKeySafe> {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) {
    return createDemoApiKey(name, scopes);
  }
  const { db } = await import('@/lib/db');
  const raw = `mqpk_live_${randomBytes(24).toString('hex')}`;
  const created = await db.partnerApiKey.create({
    data: {
      partnerId,
      name,
      keyHint: `…${raw.slice(-6)}`,
      keyHash: hashKey(raw),
      scopes,
    },
  });
  return {
    id: created.id,
    name: created.name,
    keyHint: created.keyHint,
    scopes: created.scopes,
    lastUsedAt: null,
    revokedAt: null,
    createdAt: created.createdAt.toISOString(),
    plaintext: raw,
  };
}

export async function revokeApiKey(
  partnerId: string,
  usingDemo: boolean,
  keyId: string,
) {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) {
    demoStore.apiKeys = demoStore.apiKeys.map((k) =>
      k.id === keyId ? { ...k, revokedAt: new Date().toISOString() } : k,
    );
    return { ok: true };
  }
  const { db } = await import('@/lib/db');
  await db.partnerApiKey.updateMany({
    where: { id: keyId, partnerId },
    data: { revokedAt: new Date() },
  });
  return { ok: true };
}

export async function listWebhooks(
  partnerId: string,
  usingDemo: boolean,
): Promise<PartnerWebhookRecord[]> {
  if (usingDemo || partnerId === DEMO_PARTNER_ID) return demoStore.webhooks;
  try {
    const { db } = await import('@/lib/db');
    const rows = await db.partnerWebhook.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((w) => ({
      id: w.id,
      url: w.url,
      secretHint: `…${w.secret.slice(-4)}`,
      events: w.events,
      isActive: w.isActive,
      lastDeliveryAt: w.lastDeliveryAt?.toISOString() || null,
      failureCount: w.failureCount,
      createdAt: w.createdAt.toISOString(),
    }));
  } catch {
    return demoStore.webhooks;
  }
}

export async function upsertWebhook(
  partnerId: string,
  usingDemo: boolean,
  input: { url: string; events: string[]; isActive?: boolean },
): Promise<PartnerWebhookRecord & { secret?: string }> {
  const secret = `whsec_${randomBytes(16).toString('hex')}`;
  if (usingDemo || partnerId === DEMO_PARTNER_ID) {
    const row: PartnerWebhookRecord = {
      id: `pwh-${randomBytes(3).toString('hex')}`,
      url: input.url,
      secretHint: `…${secret.slice(-4)}`,
      events: input.events,
      isActive: input.isActive ?? true,
      lastDeliveryAt: null,
      failureCount: 0,
      createdAt: new Date().toISOString(),
    };
    demoStore.webhooks = [row, ...demoStore.webhooks];
    return { ...row, secret };
  }
  const { db } = await import('@/lib/db');
  const created = await db.partnerWebhook.create({
    data: {
      partnerId,
      url: input.url,
      secret,
      events: input.events,
      isActive: input.isActive ?? true,
    },
  });
  return {
    id: created.id,
    url: created.url,
    secretHint: `…${secret.slice(-4)}`,
    events: created.events,
    isActive: created.isActive,
    lastDeliveryAt: null,
    failureCount: 0,
    createdAt: created.createdAt.toISOString(),
    secret,
  };
}

export async function submitPartnerApplication(input: {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  country?: string;
  message?: string;
}) {
  try {
    const { db } = await import('@/lib/db');
    const row = await db.partnerApplication.create({
      data: {
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email.toLowerCase(),
        phone: input.phone,
        website: input.website,
        country: input.country,
        message: input.message,
        status: 'PENDING',
      },
    });
    return { id: row.id, status: row.status, mode: 'db' as const };
  } catch {
    const id = `app-${randomBytes(4).toString('hex')}`;
    demoStore.applications.unshift({
      id,
      ...input,
      email: input.email.toLowerCase(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
    return { id, status: 'PENDING', mode: 'demo' as const };
  }
}

export async function provisionPartnerFromApplication(applicationId: string) {
  try {
    const { db } = await import('@/lib/db');
    const { hash } = await import('bcryptjs');
    const app = await db.partnerApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new Error('Application not found');
    if (app.status === 'APPROVED' && app.partnerId) {
      return { partnerId: app.partnerId, already: true };
    }

    const baseSlug = slugify(app.companyName);
    let slug = baseSlug;
    let i = 1;
    while (await db.partner.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const tempPassword = `Atlas-${randomBytes(4).toString('hex')}!`;
    const result = await db.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          slug,
          name: app.companyName,
          legalName: app.companyName,
          status: 'ACTIVE',
          plan: 'STARTER',
          contactName: app.contactName,
          contactEmail: app.email.toLowerCase(),
          contactPhone: app.phone,
          website: app.website,
          country: app.country,
          creditsPool: 50,
          commissionBps: 2000,
          activatedAt: new Date(),
        },
      });
      await tx.user.create({
        data: {
          email: app.email.toLowerCase(),
          name: app.contactName,
          passwordHash: await hash(tempPassword, 12),
          role: 'PARTNER_ADMIN',
          accountType: 'PARTNER',
          partnerId: partner.id,
          language: 'AR',
        },
      });
      await tx.partnerApplication.update({
        where: { id: app.id },
        data: { status: 'APPROVED', partnerId: partner.id },
      });
      return partner;
    });

    return {
      partnerId: result.id,
      slug: result.slug,
      tempPassword,
      email: app.email.toLowerCase(),
      already: false,
    };
  } catch (err) {
    // Demo provision
    const partnerId = `partner-${randomBytes(3).toString('hex')}`;
    return {
      partnerId,
      slug: 'provisioned-demo',
      tempPassword: 'ChangeMe-now!',
      email: 'partner@example.com',
      already: false,
      warning: err instanceof Error ? err.message : 'db unavailable',
    };
  }
}

export async function resolvePartnerByHost(host: string): Promise<PartnerRecord | null> {
  const clean = host.split(':')[0].toLowerCase();
  if (
    clean === demoStore.partner.customDomain ||
    clean.startsWith(`${demoStore.partner.slug}.`)
  ) {
    return demoStore.partner;
  }
  try {
    const { db } = await import('@/lib/db');
    const byDomain = await db.partner.findFirst({
      where: {
        OR: [
          { customDomain: clean, customDomainVerified: true },
          { slug: clean.split('.')[0] },
        ],
        status: 'ACTIVE',
      },
    });
    return (byDomain as unknown as PartnerRecord) || null;
  } catch {
    return null;
  }
}
