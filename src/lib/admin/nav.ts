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

/** Exact Super Admin routes under /admin */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: 'main',
    label: 'overview',
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
    ],
  },
  {
    id: 'interviews',
    label: 'interviews',
    items: [
      { href: '/admin/interviews/templates', label: 'templates' },
      { href: '/admin/interviews/questions', label: 'questions' },
      { href: '/admin/interviews/sessions', label: 'sessions' },
      { href: '/admin/interviews/rubrics', label: 'rubrics' },
    ],
  },
  {
    id: 'partners',
    label: 'partners',
    items: [
      { href: '/admin/partners/whitelabel', label: 'whitelabel' },
      { href: '/admin/partners/applications', label: 'applications' },
      { href: '/admin/partners/revenue', label: 'revenue' },
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
      { href: '/admin/payments/overview', label: 'overview' },
      { href: '/admin/payments/transactions', label: 'transactions' },
      { href: '/admin/payments/payouts', label: 'payouts' },
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
    id: 'misc',
    label: 'notifications',
    items: [
      { href: '/admin/notifications', label: 'notifications' },
      { href: '/admin/audit', label: 'audit' },
      { href: '/admin/applicants', label: 'applicants' },
    ],
  },
  {
    id: 'legacy',
    label: 'legacyOps',
    items: [
      { href: '/admin/interviewers', label: 'interviewers' },
      { href: '/admin/bookings', label: 'bookings' },
      { href: '/admin/payouts', label: 'payouts' },
    ],
  },
];

export function parentAdminPath(pathname: string): string {
  // Strip locale prefix if present
  let path = pathname;
  for (const loc of ['ar', 'en']) {
    if (path === `/${loc}`) path = '/';
    else if (path.startsWith(`/${loc}/`)) path = path.slice(loc.length + 1);
  }
  if (!path.startsWith('/admin')) return '/admin/dashboard';
  if (path === '/admin' || path === '/admin/dashboard') return '/admin/dashboard';
  const parts = path.split('/').filter(Boolean);
  // /admin/users/all → /admin/dashboard (section root) or /admin/users parent
  if (parts.length <= 2) return '/admin/dashboard';
  if (parts.length === 3) return '/admin/dashboard';
  return `/${parts.slice(0, -1).join('/')}`;
}
