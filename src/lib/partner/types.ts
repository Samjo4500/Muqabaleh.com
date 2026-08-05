export type PartnerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CHURNED';
export type PartnerPlan = 'STARTER' | 'GROWTH' | 'ENTERPRISE';

export type PartnerBranding = {
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  accentColor: string;
  customDomain: string | null;
  customDomainVerified: boolean;
  supportEmail: string | null;
  fromEmailName: string | null;
};

export type PartnerRecord = {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  status: PartnerStatus;
  plan: PartnerPlan;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  website: string | null;
  country: string | null;
  commissionBps: number;
  creditsPool: number;
  currency: string;
  notes: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
} & PartnerBranding;

export type PartnerClient = {
  id: string;
  name: string;
  industry: string;
  country: string;
  size: string;
  plan: string;
  credits: number;
  status: string;
  jobsCount: number;
  interviewsCount: number;
  createdAt: string;
};

export type PartnerMember = {
  id: string;
  name: string | null;
  email: string;
  role: 'PARTNER_ADMIN' | 'PARTNER_MEMBER';
  isActive: boolean;
  lastLoginAt: string | null;
};

export type PartnerApiKeySafe = {
  id: string;
  name: string;
  keyHint: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  /** Only returned once on create */
  plaintext?: string;
};

export type PartnerWebhookRecord = {
  id: string;
  url: string;
  secretHint: string;
  events: string[];
  isActive: boolean;
  lastDeliveryAt: string | null;
  failureCount: number;
  createdAt: string;
};

export type PartnerPayoutRecord = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  note: string | null;
};

export type PartnerInvoiceRecord = {
  id: string;
  number: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  issuedAt: string;
  paidAt: string | null;
};

export type PartnerDashboard = {
  partner: PartnerRecord;
  kpis: {
    clients: number;
    activeJobs: number;
    interviews30d: number;
    creditsPool: number;
    earningsCents30d: number;
    conversionRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    titleAr: string;
    at: string;
  }>;
  usageSeries: Array<{ day: string; interviews: number; invites: number }>;
};
