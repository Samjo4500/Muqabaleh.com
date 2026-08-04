'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Briefcase, MapPin } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BiInline, BiText } from '@/components/landing/crystal/BiText';
import type { Bi } from '@/components/landing/crystal/copy';

const COPY = {
  title: { en: 'Job Board', ar: 'لوحة الوظائف' } as Bi,
  subtitle: {
    en: 'Browse verified openings from employers across MENA. Apply with your Muqabaleh interview score.',
    ar: 'تصفح فرصاً موثقة من أصحاب العمل في المنطقة. قدّم بدرجات مقابلتك على مقابلة.',
  } as Bi,
  apply: { en: 'Apply', ar: 'قدّم الآن' } as Bi,
  back: { en: 'Back to home', ar: 'العودة للرئيسية' } as Bi,
  empty: {
    en: 'New roles are added regularly. Start a free interview while you wait.',
    ar: 'تُضاف فرص جديدة باستمرار. ابدأ مقابلة مجانية أثناء الانتظار.',
  } as Bi,
  ctaInterview: { en: 'Start Free Interview', ar: 'ابدأ مقابلة مجانية' } as Bi,
};

const PLACEHOLDER_JOBS = [
  {
    title: { en: 'Product Manager', ar: 'مدير منتجات' },
    company: { en: 'Growth Labs', ar: 'Growth Labs' },
    location: { en: 'Dubai · Hybrid', ar: 'دبي · هجين' },
    type: { en: 'Full-time', ar: 'دوام كامل' },
  },
  {
    title: { en: 'Software Engineer', ar: 'مهندس برمجيات' },
    company: { en: 'Northstar Tech', ar: 'Northstar Tech' },
    location: { en: 'Riyadh · On-site', ar: 'الرياض · حضوري' },
    type: { en: 'Full-time', ar: 'دوام كامل' },
  },
  {
    title: { en: 'HR Business Partner', ar: 'شريك موارد بشرية' },
    company: { en: 'Apex Talent', ar: 'Apex Talent' },
    location: { en: 'Remote · MENA', ar: 'عن بُعد · المنطقة' },
    type: { en: 'Contract', ar: 'تعاقد' },
  },
] as const;

export function JobsBoardClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div
      className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)]"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="content-wrap py-16 md:py-24">
        <Link
          href={localePath('/', locale)}
          className="mb-8 inline-block text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <BiInline bi={COPY.back} />
        </Link>

        <BiText
          as="h1"
          bi={COPY.title}
          className="mb-4"
          primaryClassName="font-display text-3xl font-bold tracking-[-0.02em] md:text-5xl"
        />
        <BiText
          as="p"
          bi={COPY.subtitle}
          className="mb-12 max-w-2xl"
          primaryClassName="text-base text-[var(--text-secondary)] md:text-lg"
        />

        <div className="grid gap-4">
          {PLACEHOLDER_JOBS.map((job) => (
            <article
              key={job.title.en}
              className="glass-card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <BiText
                  as="h2"
                  bi={job.title}
                  className="mb-1"
                  primaryClassName="font-display text-lg font-semibold"
                />
                <p className="mb-2 text-sm text-[var(--text-muted)]">
                  <BiInline bi={job.company} />
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} />
                    <BiInline bi={job.location} />
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase size={14} />
                    <BiInline bi={job.type} />
                  </span>
                </div>
              </div>
              <Link
                href={localePath('/register', locale)}
                className="glass-button inline-flex min-h-[44px] shrink-0 items-center justify-center px-5 text-sm font-semibold"
              >
                <BiInline bi={COPY.apply} />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 p-6 text-center">
          <BiText
            bi={COPY.empty}
            align="center"
            className="mb-5"
            primaryClassName="text-sm text-[var(--text-secondary)]"
          />
          <Link
            href={localePath('/demo', locale)}
            className="glass-button inline-flex min-h-[44px] items-center justify-center px-6 text-sm font-semibold"
          >
            <BiInline bi={COPY.ctaInterview} />
          </Link>
        </div>
      </div>
    </div>
  );
}
