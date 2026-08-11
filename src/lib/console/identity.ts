import type { TenantType } from './types';

/**
 * Product identity for Muqabaleh consoles.
 * "Jeannie Atelier" — the salon where hiring decisions are composed.
 */
export const CONSOLE_PRODUCT = {
  en: 'Jeannie Atelier',
  ar: 'أتيليه جيني',
  taglineEn: 'Where verified talent meets decisive teams',
  taglineAr: 'حيث تلتقي المواهب الموثّقة بالفرق الحاسمة',
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
    key: 'hire',
    en: 'Hire',
    ar: 'توظيف',
    welcomeEn: 'Welcome to your hiring salon',
    welcomeAr: 'أهلاً بك في صالون التوظيف',
    lineEn: 'Jeannie gathered tonight’s passports. Decide with signal — not noise.',
    lineAr: 'جيني جمعت جوازات الليلة. قرّر بإشارة واضحة — لا بضجيج.',
    jeannieSrc: '/images/hero-jeannie-riyadh.webp',
  },
  AGENCY: {
    key: 'partners',
    en: 'Partners',
    ar: 'شركاء',
    welcomeEn: 'Welcome to the partners salon',
    welcomeAr: 'أهلاً بك في صالون الشركاء',
    lineEn: 'Every client stays isolated. Jeannie keeps the whole house in tempo.',
    lineAr: 'كل عميل معزول. جيني تحافظ على إيقاع البيت كاملاً.',
    jeannieSrc: '/images/hero-jeannie-doha.webp',
  },
  ACADEMY: {
    key: 'campus',
    en: 'Campus',
    ar: 'حرم جامعي',
    welcomeEn: 'Welcome to the campus salon',
    welcomeAr: 'أهلاً بك في صالون الحرم',
    lineEn: 'Cohorts, readiness, privacy — Jeannie hosts the academic floor.',
    lineAr: 'دفعات وجاهزية وخصوصية — جيني تستضيف الطابق الأكاديمي.',
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

export function welcomeStorageKey(tenantSlug: string) {
  return `mq-jeannie-atelier-welcome:${tenantSlug}`;
}
