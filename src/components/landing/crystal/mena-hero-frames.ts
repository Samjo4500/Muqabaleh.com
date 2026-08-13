import type { ScoreBadgeStatus } from '@/components/brand/muqabaleh-score-badge';

/**
 * MENA hero skyline frames for Jeannie.
 * Frame 0 (Dubai) is the LCP image — keep it first and priority-loaded.
 * Later frames are only swapped in after idle so they do not compete with LCP.
 */
export type MenaHeroFrame = {
  id: 'dubai' | 'riyadh' | 'amman' | 'doha';
  src: string;
  cityEn: string;
  cityAr: string;
  altEn: string;
  altAr: string;
  objectPosition: string;
  badgeStatus: ScoreBadgeStatus;
};

export const MENA_JEANNIE_FRAMES: MenaHeroFrame[] = [
  {
    id: 'dubai',
    src: '/images/hero-interview.webp',
    cityEn: 'Dubai',
    cityAr: 'دبي',
    altEn: 'Muqabaleh AI mock interview platform for MENA job seekers',
    altAr: 'منصة مقابلة لتدريب مقابلات العمل بالذكاء الاصطناعي لباحثي العمل في الشرق الأوسط',
    objectPosition: 'center 18%',
    badgeStatus: 'interview',
  },
  {
    id: 'riyadh',
    src: '/images/hero-jeannie-riyadh.webp',
    cityEn: 'Riyadh',
    cityAr: 'الرياض',
    altEn: 'Jeannie — Muqabaleh career agent with Riyadh skyline',
    altAr: 'جيني — وكيلة مقابلة المهنية مع أفق الرياض',
    objectPosition: 'center 18%',
    badgeStatus: 'scored',
  },
  {
    id: 'amman',
    src: '/images/hero-jeannie-amman.webp',
    cityEn: 'Amman',
    cityAr: 'عمّان',
    altEn: 'Jeannie — Muqabaleh career agent with Amman skyline',
    altAr: 'جيني — وكيلة مقابلة المهنية مع أفق عمّان',
    objectPosition: 'center 20%',
    badgeStatus: 'interview',
  },
  {
    id: 'doha',
    src: '/images/hero-jeannie-doha.webp',
    cityEn: 'Doha',
    cityAr: 'الدوحة',
    altEn: 'Jeannie — Muqabaleh career agent with Doha skyline',
    altAr: 'جيني — وكيلة مقابلة المهنية مع أفق الدوحة',
    objectPosition: 'center 18%',
    badgeStatus: 'hired',
  },
];

export type MenaJobsSkyline = {
  id: 'dubai' | 'riyadh' | 'amman' | 'doha';
  src: string;
  cityEn: string;
  cityAr: string;
  altEn: string;
  altAr: string;
};

export const MENA_JOBS_SKYLINES: MenaJobsSkyline[] = [
  {
    id: 'dubai',
    src: '/images/jobs-mena-hero.webp',
    cityEn: 'Dubai',
    cityAr: 'دبي',
    altEn: 'Dubai skyline — real professional roles across MENA',
    altAr: 'أفق دبي — وظائف مهنية حقيقية عبر المنطقة',
  },
  {
    id: 'riyadh',
    src: '/images/jobs-skyline-riyadh.webp',
    cityEn: 'Riyadh',
    cityAr: 'الرياض',
    altEn: 'Riyadh skyline — real professional roles across MENA',
    altAr: 'أفق الرياض — وظائف مهنية حقيقية عبر المنطقة',
  },
  {
    id: 'amman',
    src: '/images/jobs-skyline-amman.webp',
    cityEn: 'Amman',
    cityAr: 'عمّان',
    altEn: 'Amman skyline — real professional roles across MENA',
    altAr: 'أفق عمّان — وظائف مهنية حقيقية عبر المنطقة',
  },
  {
    id: 'doha',
    src: '/images/jobs-skyline-doha.webp',
    cityEn: 'Doha',
    cityAr: 'الدوحة',
    altEn: 'Doha skyline — real professional roles across MENA',
    altAr: 'أفق الدوحة — وظائف مهنية حقيقية عبر المنطقة',
  },
];

/** Warm the next frame only — never prefetch the whole set at once. */
export function prefetchNextImage(src: string) {
  if (typeof window === 'undefined') return;
  const img = new window.Image();
  img.decoding = 'async';
  img.src = src;
}
