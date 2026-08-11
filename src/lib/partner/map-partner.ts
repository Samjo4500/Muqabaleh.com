import type { PartnerRecord } from './types';

export function mapPartnerRow(p: Record<string, unknown>): PartnerRecord {
  return {
    id: p.id as string,
    slug: p.slug as string,
    name: p.name as string,
    legalName: (p.legalName as string) || null,
    status: (p.status as PartnerRecord['status']) || 'PENDING',
    plan: (p.plan as PartnerRecord['plan']) || 'STARTER',
    contactName: p.contactName as string,
    contactEmail: p.contactEmail as string,
    contactPhone: (p.contactPhone as string) || null,
    website: (p.website as string) || null,
    country: (p.country as string) || null,
    logoUrl: (p.logoUrl as string) || null,
    faviconUrl: (p.faviconUrl as string) || null,
    primaryColor: (p.primaryColor as string) || '#14B8A6',
    accentColor: (p.accentColor as string) || '#D4A843',
    customDomain: (p.customDomain as string) || null,
    customDomainVerified: Boolean(p.customDomainVerified),
    supportEmail: (p.supportEmail as string) || null,
    fromEmailName: (p.fromEmailName as string) || null,
    commissionBps: (p.commissionBps as number) ?? 2000,
    creditsPool: (p.creditsPool as number) ?? 0,
    currency: (p.currency as string) || 'USD',
    notes: (p.notes as string) || null,
    activatedAt: p.activatedAt
      ? new Date(p.activatedAt as string | Date).toISOString()
      : null,
    createdAt: new Date(p.createdAt as string | Date).toISOString(),
    updatedAt: new Date(p.updatedAt as string | Date).toISOString(),
  };
}
