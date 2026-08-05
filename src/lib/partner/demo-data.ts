import { createHash, randomBytes } from 'crypto';
import type {
  PartnerApiKeySafe,
  PartnerClient,
  PartnerInvoiceRecord,
  PartnerMember,
  PartnerPayoutRecord,
  PartnerRecord,
  PartnerWebhookRecord,
} from './types';

const DEMO_PARTNER_ID = 'partner-demo-atlas';
const DEMO_ADMIN_USER_ID = 'user-partner-demo-admin';

function hashKey(raw: string) {
  return createHash('sha256').update(raw).digest('hex');
}

function isoDaysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

export const DEMO_PARTNER: PartnerRecord = {
  id: DEMO_PARTNER_ID,
  slug: 'atlas-talent',
  name: 'Atlas Talent',
  legalName: 'Atlas Talent Partners LLC',
  status: 'ACTIVE',
  plan: 'GROWTH',
  contactName: 'Layla Al-Hassan',
  contactEmail: 'partner@atlas.demo',
  contactPhone: '+971500000001',
  website: 'https://atlas-talent.demo',
  country: 'AE',
  logoUrl: '/images/logos/v2-balanced-a-T.webp',
  faviconUrl: null,
  primaryColor: '#0D9488',
  accentColor: '#E8C97A',
  customDomain: 'hire.atlas-talent.demo',
  customDomainVerified: true,
  supportEmail: 'support@atlas-talent.demo',
  fromEmailName: 'Atlas Talent Interviews',
  commissionBps: 2500,
  creditsPool: 240,
  currency: 'USD',
  notes: 'Seeded demo partner for the white-label console.',
  activatedAt: isoDaysAgo(90),
  createdAt: isoDaysAgo(120),
  updatedAt: isoDaysAgo(1),
};

export const DEMO_MEMBERS: PartnerMember[] = [
  {
    id: DEMO_ADMIN_USER_ID,
    name: 'Layla Al-Hassan',
    email: 'partner@atlas.demo',
    role: 'PARTNER_ADMIN',
    isActive: true,
    lastLoginAt: isoDaysAgo(0),
  },
  {
    id: 'user-partner-demo-ops',
    name: 'Omar Faris',
    email: 'ops@atlas.demo',
    role: 'PARTNER_MEMBER',
    isActive: true,
    lastLoginAt: isoDaysAgo(2),
  },
];

export const DEMO_CLIENTS: PartnerClient[] = [
  {
    id: 'client-nova',
    name: 'Nova Bank',
    industry: 'FINTECH',
    country: 'SA',
    size: 'LARGE',
    plan: 'B2B_GROWTH',
    credits: 80,
    status: 'ACTIVE',
    jobsCount: 6,
    interviewsCount: 148,
    createdAt: isoDaysAgo(60),
  },
  {
    id: 'client-qamar',
    name: 'Qamar Health',
    industry: 'HEALTHCARE',
    country: 'AE',
    size: 'MEDIUM',
    plan: 'B2B_STARTER',
    credits: 25,
    status: 'ACTIVE',
    jobsCount: 3,
    interviewsCount: 67,
    createdAt: isoDaysAgo(40),
  },
  {
    id: 'client-sand',
    name: 'Sand & Steel Logistics',
    industry: 'MANUFACTURING',
    country: 'QA',
    size: 'MEDIUM',
    plan: 'B2B_STARTER',
    credits: 12,
    status: 'ACTIVE',
    jobsCount: 2,
    interviewsCount: 31,
    createdAt: isoDaysAgo(18),
  },
  {
    id: 'client-mirage',
    name: 'Mirage Retail Group',
    industry: 'RETAIL',
    country: 'EG',
    size: 'LARGE',
    plan: 'B2B_ENTERPRISE',
    credits: 0,
    status: 'SUSPENDED',
    jobsCount: 4,
    interviewsCount: 92,
    createdAt: isoDaysAgo(75),
  },
];

const demoRawKey = 'mqpk_live_demo_atlas_7f3c9e2a';

export let DEMO_API_KEYS: PartnerApiKeySafe[] = [
  {
    id: 'pak-1',
    name: 'Production',
    keyHint: `…${demoRawKey.slice(-6)}`,
    scopes: ['read', 'write', 'webhooks'],
    lastUsedAt: isoDaysAgo(1),
    revokedAt: null,
    createdAt: isoDaysAgo(80),
  },
];

export const DEMO_KEY_HASHES: Record<string, string> = {
  [hashKey(demoRawKey)]: 'pak-1',
};

export let DEMO_WEBHOOKS: PartnerWebhookRecord[] = [
  {
    id: 'pwh-1',
    url: 'https://atlas-talent.demo/hooks/muqabaleh',
    secretHint: '…a91c',
    events: ['interview.completed', 'candidate.scored', 'job.created'],
    isActive: true,
    lastDeliveryAt: isoDaysAgo(1),
    failureCount: 0,
    createdAt: isoDaysAgo(70),
  },
];

export const DEMO_PAYOUTS: PartnerPayoutRecord[] = [
  {
    id: 'pp-1',
    amountCents: 428000,
    currency: 'USD',
    status: 'COMPLETED',
    periodStart: isoDaysAgo(60),
    periodEnd: isoDaysAgo(30),
    paidAt: isoDaysAgo(28),
    note: 'June revenue share',
  },
  {
    id: 'pp-2',
    amountCents: 512500,
    currency: 'USD',
    status: 'PROCESSING',
    periodStart: isoDaysAgo(30),
    periodEnd: isoDaysAgo(0),
    paidAt: null,
    note: 'July revenue share',
  },
];

export const DEMO_INVOICES: PartnerInvoiceRecord[] = [
  {
    id: 'pi-1',
    number: 'ATL-2026-007',
    amountCents: 99000,
    currency: 'USD',
    status: 'PAID',
    description: 'Growth plan — July',
    issuedAt: isoDaysAgo(25),
    paidAt: isoDaysAgo(23),
  },
  {
    id: 'pi-2',
    number: 'ATL-2026-008',
    amountCents: 99000,
    currency: 'USD',
    status: 'OPEN',
    description: 'Growth plan — August',
    issuedAt: isoDaysAgo(2),
    paidAt: null,
  },
];

/** Mutable in-memory store for demo mode mutations */
export const demoStore = {
  partner: { ...DEMO_PARTNER },
  members: [...DEMO_MEMBERS],
  clients: [...DEMO_CLIENTS],
  apiKeys: [...DEMO_API_KEYS],
  keyHashes: { ...DEMO_KEY_HASHES },
  webhooks: [...DEMO_WEBHOOKS],
  payouts: [...DEMO_PAYOUTS],
  invoices: [...DEMO_INVOICES],
  applications: [] as Array<Record<string, unknown>>,
};

export function resetDemoPartnerFromSeed() {
  demoStore.partner = { ...DEMO_PARTNER };
  demoStore.members = [...DEMO_MEMBERS];
  demoStore.clients = [...DEMO_CLIENTS];
  demoStore.apiKeys = [...DEMO_API_KEYS];
  demoStore.keyHashes = { ...DEMO_KEY_HASHES };
  demoStore.webhooks = [...DEMO_WEBHOOKS];
  demoStore.payouts = [...DEMO_PAYOUTS];
  demoStore.invoices = [...DEMO_INVOICES];
}

export function createDemoApiKey(name: string, scopes: string[]): PartnerApiKeySafe {
  const raw = `mqpk_live_${randomBytes(16).toString('hex')}`;
  const id = `pak-${randomBytes(4).toString('hex')}`;
  const record: PartnerApiKeySafe = {
    id,
    name,
    keyHint: `…${raw.slice(-6)}`,
    scopes,
    lastUsedAt: null,
    revokedAt: null,
    createdAt: new Date().toISOString(),
    plaintext: raw,
  };
  demoStore.apiKeys = [record, ...demoStore.apiKeys];
  demoStore.keyHashes[hashKey(raw)] = id;
  DEMO_API_KEYS = demoStore.apiKeys;
  return record;
}

export function buildDemoDashboard() {
  const p = demoStore.partner;
  const series = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    return {
      day: d.toISOString().slice(0, 10),
      interviews: 4 + ((i * 3) % 9),
      invites: 8 + ((i * 5) % 12),
    };
  });
  return {
    partner: p,
    kpis: {
      clients: demoStore.clients.filter((c) => c.status === 'ACTIVE').length,
      activeJobs: demoStore.clients.reduce((n, c) => n + c.jobsCount, 0),
      interviews30d: 186,
      creditsPool: p.creditsPool,
      earningsCents30d: 512500,
      conversionRate: 0.64,
    },
    recentActivity: [
      {
        id: 'a1',
        type: 'interview',
        title: 'Nova Bank completed 12 AI interviews',
        titleAr: 'نوفا بنك أكملت ١٢ مقابلة بالذكاء الاصطناعي',
        at: isoDaysAgo(0),
      },
      {
        id: 'a2',
        type: 'client',
        title: 'Qamar Health requested more credits',
        titleAr: 'قمر هيلث طلبت رصيداً إضافياً',
        at: isoDaysAgo(1),
      },
      {
        id: 'a3',
        type: 'webhook',
        title: 'Webhook delivered: candidate.scored',
        titleAr: 'تم تسليم Webhook: candidate.scored',
        at: isoDaysAgo(1),
      },
      {
        id: 'a4',
        type: 'payout',
        title: 'July payout entered processing',
        titleAr: 'دفعة يوليو قيد المعالجة',
        at: isoDaysAgo(2),
      },
    ],
    usageSeries: series,
  };
}

export { DEMO_PARTNER_ID, DEMO_ADMIN_USER_ID, hashKey, demoRawKey };
