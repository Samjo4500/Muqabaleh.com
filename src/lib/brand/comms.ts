/**
 * Shared Muqabaleh communication brand tokens.
 * Used by passport PDFs + transactional emails so everything feels one system.
 */

export const MUQABALEH_BRAND = {
  name: 'Muqabaleh',
  nameAr: 'مقابلة',
  taglineEn: 'AI Interview Coach',
  taglineAr: 'مدرب المقابلات الذكي',
  siteUrl: 'https://muqabaleh.com',
  supportEmail: 'support@muqabaleh.com',
  senders: {
    passport: { name: 'Muqabaleh', email: 'passport@muqabaleh.com' },
    system: { name: 'Muqabaleh', email: 'noreply@muqabaleh.com' },
    nurture: { name: 'Jeannie from Muqabaleh', email: 'info@muqabaleh.com' },
  },
  replyTo: { name: 'Muqabaleh Support', email: 'support@muqabaleh.com' },
  nurtureReplyTo: { name: 'Muqabaleh', email: 'info@muqabaleh.com' },
  colors: {
    navy: '#0B1F33',
    navyDeep: '#071523',
    teal: '#14B8A6',
    tealSoft: '#2DD4BF',
    ink: '#0F172A',
    body: '#334155',
    muted: '#64748B',
    line: '#E2E8F0',
    paper: '#F1F5F9',
    paperSoft: '#F8FAFC',
    white: '#FFFFFF',
    grade: '#0D9488',
  },
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    MUQABALEH_BRAND.siteUrl
  );
}

export function localePath(path: string, locale: 'ar' | 'en'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'ar') return `${appBaseUrl()}${clean}`;
  return `${appBaseUrl()}/en${clean}`;
}
