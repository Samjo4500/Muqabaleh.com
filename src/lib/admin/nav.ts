import type { LabelKey } from './labels';

export type AdminNavItem = {
  href: string;
  label: LabelKey;
};

export type AdminNavGroup = {
  id: string;
  label: LabelKey;
  items: AdminNavItem[];
};

/**
 * Super Admin sidebar — live ops first, then content/config.
 * Paths are under /admin (locale-aware via localePath).
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: 'system-health',
    label: 'systemHealth',
    items: [{ href: '/admin/system-health', label: 'systemHealth' }],
  },
  {
    id: 'dashboard',
    label: 'dashboard',
    items: [{ href: '/admin/dashboard', label: 'dashboard' }],
  },
  {
    id: 'users',
    label: 'users',
    items: [
      { href: '/admin/users/all', label: 'allUsers' },
      { href: '/admin/users/candidates', label: 'candidates' },
      { href: '/admin/users/admins', label: 'admins' },
      { href: '/admin/users/companies', label: 'companies' },
      { href: '/admin/users/entitlements', label: 'entitlements' },
    ],
  },
  {
    id: 'interviews',
    label: 'interviews',
    items: [
      { href: '/admin/coach', label: 'coachOverview' },
      { href: '/admin/passports', label: 'passports' },
      { href: '/admin/interviews/templates', label: 'templates' },
      { href: '/admin/interviews/questions', label: 'questions' },
      { href: '/admin/interviews/sessions', label: 'sessions' },
      { href: '/admin/interviews/mock-sessions', label: 'mockSessions' },
      { href: '/admin/interviews/rubrics', label: 'rubrics' },
    ],
  },
  {
    id: 'jobs',
    label: 'jobsBoard',
    items: [
      { href: '/admin/jobs/aggregator', label: 'atsAggregator' },
      { href: '/admin/b2b/jobs', label: 'b2bJobs' },
      { href: '/admin/b2b/applications', label: 'b2bApplications' },
      { href: '/admin/applicants', label: 'applicants' },
      { href: '/admin/campaigns/student100', label: 'student100' },
    ],
  },
  {
    id: 'marketplace',
    label: 'legacyOps',
    items: [
      { href: '/admin/interviewers', label: 'interviewers' },
      { href: '/admin/bookings', label: 'bookings' },
      { href: '/admin/payouts', label: 'interviewerPayouts' },
    ],
  },
  {
    id: 'partners',
    label: 'partners',
    items: [
      { href: '/admin/partners/list', label: 'partnersList' },
      { href: '/admin/partners/applications', label: 'applications' },
      { href: '/admin/partners/whitelabel', label: 'whitelabel' },
      { href: '/admin/partners/revenue', label: 'revenueShare' },
    ],
  },
  {
    id: 'billing',
    label: 'billing',
    items: [
      { href: '/admin/billing/plans', label: 'plans' },
      { href: '/admin/billing/subscriptions', label: 'subscriptions' },
      { href: '/admin/billing/invoices', label: 'invoices' },
    ],
  },
  {
    id: 'payments',
    label: 'payments',
    items: [
      { href: '/admin/payments/transactions', label: 'transactions' },
      { href: '/admin/payments/payouts', label: 'partnerPayouts' },
      { href: '/admin/payments/overview', label: 'financialOverview' },
    ],
  },
  {
    id: 'ai',
    label: 'aiApis',
    items: [
      { href: '/admin/ai-apis/providers', label: 'providers' },
      { href: '/admin/ai-apis/keys', label: 'keys' },
      { href: '/admin/ai-apis/prompts', label: 'prompts' },
      { href: '/admin/ai-apis/usage', label: 'usage' },
    ],
  },
  {
    id: 'content',
    label: 'content',
    items: [
      { href: '/admin/content/landing', label: 'landing' },
      { href: '/admin/content/emails', label: 'emails' },
      { href: '/admin/content/email-queue', label: 'emailQueue' },
      { href: '/admin/content/notifications', label: 'notifications' },
    ],
  },
  {
    id: 'analytics',
    label: 'analytics',
    items: [
      { href: '/admin/analytics/website', label: 'website' },
      { href: '/admin/analytics/behavior', label: 'behavior' },
      { href: '/admin/analytics/interviews', label: 'interviews' },
    ],
  },
  {
    id: 'settings',
    label: 'settings',
    items: [
      { href: '/admin/settings/general', label: 'general' },
      { href: '/admin/settings/security', label: 'security' },
      { href: '/admin/settings/access', label: 'access' },
      { href: '/admin/settings/backup', label: 'backup' },
    ],
  },
  {
    id: 'support',
    label: 'support',
    items: [
      { href: '/admin/support/tickets', label: 'tickets' },
      { href: '/admin/support/chat', label: 'chat' },
    ],
  },
  {
    id: 'notifications',
    label: 'notifications',
    items: [{ href: '/admin/notifications', label: 'notifications' }],
  },
  {
    id: 'audit',
    label: 'audit',
    items: [{ href: '/admin/audit', label: 'audit' }],
  },
];

export function parentAdminPath(pathname: string): string {
  let path = pathname;
  for (const loc of ['ar', 'en']) {
    if (path === `/${loc}`) path = '/';
    else if (path.startsWith(`/${loc}/`)) path = path.slice(loc.length + 1);
  }
  if (!path.startsWith('/admin')) return '/admin/dashboard';
  if (path === '/admin' || path === '/admin/dashboard') return '/admin/dashboard';
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 2) return '/admin/dashboard';
  if (parts.length === 3) return '/admin/dashboard';
  return `/${parts.slice(0, -1).join('/')}`;
}
