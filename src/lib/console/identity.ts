import type { TenantType } from './types';

/**
 * Product identity for Muqabaleh executive consoles.
 * Jeannie Suite — private portal for decisive leadership.
 */
export const CONSOLE_PRODUCT = {
  en: 'Jeannie Suite',
  ar: 'جناح جيني',
  taglineEn: 'Private executive workspace for decisive hiring',
  taglineAr: 'مساحة تنفيذية خاصة لتوظيف حاسم',
  portalEn: 'Welcome to your portal',
  portalAr: 'مرحباً بكم في بوابتكم',
  serviceEn: "I'm Jeannie at your service",
  serviceAr: 'أنا جيني في خدمتكم',
} as const;

export type ConsoleEdition = {
  key: string;
  en: string;
  ar: string;
  welcomeEn: string;
  welcomeAr: string;
  lineEn: string;
  lineAr: string;
  jeannieSrc: string;
};

const EDITIONS: Record<TenantType, ConsoleEdition> = {
  EMPLOYER: {
    key: 'executive',
    en: 'Executive',
    ar: 'تنفيذي',
    welcomeEn: 'Your executive hiring suite',
    welcomeAr: 'جناحكم التنفيذي للتوظيف',
    lineEn: 'Verified passports. Clear signal. Decisions at board speed.',
    lineAr: 'جوازات موثّقة. إشارة واضحة. قرارات بسرعة مجلس الإدارة.',
    jeannieSrc: '/images/hero-jeannie-riyadh.webp',
  },
  AGENCY: {
    key: 'alliance',
    en: 'Alliance',
    ar: 'تحالف',
    welcomeEn: 'Your alliance command suite',
    welcomeAr: 'جناح قيادة التحالف',
    lineEn: 'Every client isolated. One private floor for your whole practice.',
    lineAr: 'كل عميل معزول. طابق خاص لممارستكم كاملة.',
    jeannieSrc: '/images/hero-jeannie-doha.webp',
  },
  ACADEMY: {
    key: 'academy',
    en: 'Academy',
    ar: 'أكاديمية',
    welcomeEn: 'Your academic readiness suite',
    welcomeAr: 'جناح الجاهزية الأكاديمية',
    lineEn: 'Cohorts, readiness, and privacy — composed for academic leadership.',
    lineAr: 'دفعات وجاهزية وخصوصية — مصمّمة للقيادة الأكاديمية.',
    jeannieSrc: '/images/hero-jeannie-amman.webp',
  },
};

export function getConsoleEdition(tenantType: TenantType): ConsoleEdition {
  return EDITIONS[tenantType] || EDITIONS.EMPLOYER;
}

export function consoleFullName(tenantType: TenantType, locale: string) {
  const edition = getConsoleEdition(tenantType);
  if (locale === 'ar') {
    return `${CONSOLE_PRODUCT.ar} · ${edition.ar}`;
  }
  return `${CONSOLE_PRODUCT.en} · ${edition.en}`;
}

/** Bumped when the welcome experience is redesigned so guests see it again. */
export function welcomeStorageKey(tenantSlug: string) {
  return `mq-jeannie-portal-welcome:v6:${tenantSlug}`;
}
