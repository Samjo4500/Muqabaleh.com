export const APPLICATION_STAGES = [
  'NEW',
  'REVIEWING',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
] as const;

export type ApplicationStageValue = (typeof APPLICATION_STAGES)[number];

export const JOB_STATUSES = ['DRAFT', 'OPEN', 'PAUSED', 'CLOSED'] as const;
export type JobStatusValue = (typeof JOB_STATUSES)[number];

export const EMPLOYMENT_TYPES = ['fulltime', 'parttime', 'contract', 'hybrid', 'remote'] as const;

export const PHOTO_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const CV_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const MAX_PHOTO_BYTES = 800 * 1024; // 800 KB
export const MAX_CV_BYTES = 3 * 1024 * 1024; // 3 MB

export const STAGE_LABELS: Record<
  ApplicationStageValue,
  { en: string; ar: string }
> = {
  NEW: { en: 'New', ar: 'جديد' },
  REVIEWING: { en: 'Reviewing', ar: 'قيد المراجعة' },
  SCREENING: { en: 'Screening', ar: 'فرز' },
  INTERVIEW: { en: 'Interview', ar: 'مقابلة' },
  OFFER: { en: 'Offer', ar: 'عرض' },
  HIRED: { en: 'Hired', ar: 'تم التوظيف' },
  REJECTED: { en: 'Rejected', ar: 'مرفوض' },
  WITHDRAWN: { en: 'Withdrawn', ar: 'منسحب' },
};
