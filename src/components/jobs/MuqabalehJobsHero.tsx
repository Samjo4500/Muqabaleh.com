'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';

type FeaturedJob = {
  id: string;
  company: string;
  mark: string;
  markBg: string;
  titleEn: string;
  titleAr: string;
  locationEn: string;
  locationAr: string;
  flag: string;
  deptEn: string;
  deptAr: string;
  deptTone: string;
  blurbEn: string;
  blurbAr: string;
  score: number;
  jeannieSrc: string;
  skylineSrc: string;
};

/**
 * Featured Job-of-the-Day slate from the Muqabaleh design package
 * (Careem · MongoDB · Tamara · Cloudflare · Careem-Amman · Trendyol).
 */
const FEATURED_JOBS: FeaturedJob[] = [
  {
    id: 'careem-dubai',
    company: 'Careem',
    mark: 'C',
    markBg: 'bg-[#00E0A0] text-[#04221a]',
    titleEn: 'Staff Software Engineer',
    titleAr: 'مهندس برمجيات أول',
    locationEn: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    flag: '🇦🇪',
    deptEn: 'Technology',
    deptAr: 'تقنية',
    deptTone: 'bg-teal-500/15 text-teal-200 border-teal-400/30',
    blurbEn:
      'Build products used by millions across the Middle East — and walk in interview-ready.',
    blurbAr:
      'ابنِ منتجات يستخدمها ملايين في الشرق الأوسط — وادخل المقابلة جاهزاً.',
    score: 88,
    jeannieSrc: '/images/hero-interview.webp',
    skylineSrc: '/images/jobs-mena-hero.webp',
  },
  {
    id: 'mongodb-dubai',
    company: 'MongoDB',
    mark: 'M',
    markBg: 'bg-[#00ED64] text-[#04160c]',
    titleEn: 'Enterprise Account Executive',
    titleAr: 'ممثل حسابات مؤسسي',
    locationEn: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    flag: '🇦🇪',
    deptEn: 'Sales',
    deptAr: 'مبيعات',
    deptTone: 'bg-violet-500/15 text-violet-200 border-violet-400/30',
    blurbEn:
      'Grow MongoDB across the Gulf and win major enterprise accounts in the region.',
    blurbAr: 'نمّ أعمال MongoDB في الخليج وافتح حسابات جديدة كبرى في المنطقة.',
    score: 84,
    jeannieSrc: '/images/hero-interview.webp',
    skylineSrc: '/images/jobs-mena-hero.webp',
  },
  {
    id: 'tamara-riyadh',
    company: 'Tamara',
    mark: 'T',
    markBg: 'bg-[#C8F135] text-[#1a2204]',
    titleEn: 'Fraud Investigator',
    titleAr: 'محقق احتيال',
    locationEn: 'Riyadh, KSA',
    locationAr: 'الرياض، السعودية',
    flag: '🇸🇦',
    deptEn: 'Finance',
    deptAr: 'مالية',
    deptTone: 'bg-amber-500/15 text-amber-100 border-amber-400/30',
    blurbEn:
      'Monitor transactions and spot suspicious patterns inside a fast-growing payments platform.',
    blurbAr:
      'راقب المعاملات واكتشف الأنماط المشبوهة داخل منصة مدفوعات سريعة النمو.',
    score: 81,
    jeannieSrc: '/images/hero-jeannie-riyadh.webp',
    skylineSrc: '/images/jobs-skyline-riyadh.webp',
  },
  {
    id: 'cloudflare-cairo',
    company: 'Cloudflare',
    mark: 'C',
    markBg: 'bg-[#F6821F] text-[#1a0d02]',
    titleEn: 'Senior Territory AE, Egypt',
    titleAr: 'مدير حسابات أول — مصر',
    locationEn: 'Cairo, Egypt',
    locationAr: 'القاهرة، مصر',
    flag: '🇪🇬',
    deptEn: 'Sales',
    deptAr: 'مبيعات',
    deptTone: 'bg-violet-500/15 text-violet-200 border-violet-400/30',
    blurbEn:
      "Run full enterprise sales cycles with one of the world's strongest web networks.",
    blurbAr:
      'قد دورات مبيعات مؤسسية كاملة مع واحدة من أقوى شبكات الويب في العالم.',
    score: 83,
    jeannieSrc: '/images/hero-interview.webp',
    skylineSrc: '/images/jobs-mena-hero.webp',
  },
  {
    id: 'careem-amman',
    company: 'Careem',
    mark: 'C',
    markBg: 'bg-[#00E0A0] text-[#04221a]',
    titleEn: 'Operations Coordinator',
    titleAr: 'منسق عمليات',
    locationEn: 'Amman, Jordan',
    locationAr: 'عمّان، الأردن',
    flag: '🇯🇴',
    deptEn: 'Operations',
    deptAr: 'عمليات',
    deptTone: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
    blurbEn:
      "Join the Shops team and elevate delivery experiences across the Kingdom's markets.",
    blurbAr:
      'انضم لفريق المتاجر وارفع تجارب التوصيل عبر أسواق المملكة.',
    score: 79,
    jeannieSrc: '/images/hero-jeannie-amman.webp',
    skylineSrc: '/images/jobs-skyline-amman.webp',
  },
  {
    id: 'trendyol-riyadh',
    company: 'Trendyol',
    mark: 'T',
    markBg: 'bg-[#F27A1A] text-[#1a0c02]',
    titleEn: 'Marketing Intern',
    titleAr: 'متدرّب تسويق',
    locationEn: 'Riyadh, KSA',
    locationAr: 'الرياض، السعودية',
    flag: '🇸🇦',
    deptEn: 'Marketing',
    deptAr: 'تسويق',
    deptTone: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/30',
    blurbEn:
      "Start your marketing career with the region's biggest e-commerce platform.",
    blurbAr: 'ابدأ مسيرتك التسويقية مع أكبر منصة تجارة إلكترونية في المنطقة.',
    score: 76,
    jeannieSrc: '/images/hero-jeannie-riyadh.webp',
    skylineSrc: '/images/jobs-skyline-riyadh.webp',
  },
];

type Props = {
  roleCount?: number;
};

/**
 * Job of the Day hero — rotating featured MENA roles + Jeannie passport,
 * matching the Muqabaleh design package (EN/AR).
 */
export function MuqabalehJobsHero({ roleCount = 0 }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const job = FEATURED_JOBS[index];
  const jobsLabel = roleCount > 0 ? roleCount : 166;

  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % FEATURED_JOBS.length);
    }, 8400);
    return () => window.clearInterval(id);
  }, [reduceMotion, paused]);

  return (
    <section
      className="relative min-h-[92svh] overflow-hidden bg-[#05080f]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={job.skylineSrc}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
        >
          <Image
            src={job.skylineSrc}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            quality={68}
            className="object-cover object-[center_40%] opacity-55"
          />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, rgba(5,8,15,0.94) 0%, rgba(5,8,15,0.78) 45%, rgba(5,8,15,0.55) 100%), linear-gradient(180deg, rgba(5,8,15,0.2) 0%, rgba(5,8,15,0.9) 100%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-teal-400/10 blur-[120px]"
        aria-hidden
      />

      <div className="mq-wrap relative z-10 flex min-h-[92svh] flex-col justify-center pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="mb-8 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            {isAr
              ? `وظيفة اليوم · أكثر من ${jobsLabel} وظيفة حقيقية`
              : `Job of the Day · ${jobsLabel}+ real jobs`}
          </span>
          <BrandLogo size="md" priority />
        </div>

        <div
          className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Job copy — LTR left / RTL right via dir */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={job.id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black ${job.markBg}`}
                    aria-hidden
                  >
                    {job.mark}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{job.company}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                      {isAr ? 'على مقابلة' : 'On Muqabaleh'}
                    </p>
                  </div>
                </div>

                <h1 className="mq-display text-[clamp(2rem,5.5vw,3.6rem)] font-bold leading-[1.05] tracking-tight text-white">
                  {isAr ? job.titleAr : job.titleEn}
                </h1>
                {isAr ? (
                  <p className="mt-2 text-sm text-white/45">{job.titleEn}</p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85">
                    <span aria-hidden>{job.flag}</span>
                    {isAr ? job.locationAr : job.locationEn}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${job.deptTone}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {isAr ? job.deptAr : job.deptEn}
                  </span>
                </div>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                  {isAr ? job.blurbAr : job.blurbEn}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href={localePath('/interview/prequal', locale)}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-300 px-7 text-sm font-bold text-[#041016] shadow-[0_0_36px_rgba(34,211,238,0.35)] transition-transform hover:scale-[1.02]"
                  >
                    {isAr ? 'تدرّب مع جيني مجاناً' : 'Train with Jeannie — Free'}
                    <span aria-hidden>{isAr ? '←' : '→'}</span>
                  </Link>
                  <a
                    href="#roles"
                    className="mq-btn mq-btn-on-dark-ghost inline-flex min-h-[52px] items-center justify-center px-7 text-sm font-bold"
                  >
                    {isAr ? 'استعرض الوظائف' : 'Browse roles'}
                  </a>
                </div>

                <p className="mt-4 flex items-center gap-2 text-xs text-white/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400/80" />
                  {isAr
                    ? `أكثر من ${jobsLabel} وظيفة حقيقية في الخليج والشام · الراتب لدى الشركة`
                    : `${jobsLabel}+ real jobs across the Gulf & Levant · Salary at the company`}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="mt-7 flex items-center gap-2" role="tablist" aria-label="Featured jobs">
              {FEATURED_JOBS.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={item.titleEn}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index
                      ? 'w-7 bg-cyan-300'
                      : 'w-2 bg-white/25 hover:bg-white/45'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Jeannie + passport */}
          <div className="relative mx-auto w-full max-w-[340px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${job.id}-portrait`}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#0a1018] shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={job.jeannieSrc}
                    alt={isAr ? 'جيني — مدربة المقابلات' : 'Jeannie — AI Interview Coach'}
                    fill
                    sizes="340px"
                    className="object-cover object-[center_18%]"
                    priority={index === 0}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(5,8,15,0.05) 40%, rgba(5,8,15,0.85) 100%)',
                    }}
                    aria-hidden
                  />
                  <span className="absolute top-4 end-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {isAr ? 'تدرّب الآن' : 'Train now'}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-4">
                    <div>
                      <p className="text-lg font-bold text-white">
                        {isAr ? 'جيني' : 'Jeannie'}
                      </p>
                      <p className="text-[11px] font-medium text-white/60">
                        {isAr ? 'مدربة المقابلات AI' : 'AI Interview Coach'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.div
              key={`${job.id}-score`}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className={`absolute -bottom-3 ${isAr ? '-start-2 sm:-start-4' : '-end-2 sm:-end-4'} w-[min(100%,240px)] rounded-2xl border border-cyan-300/25 bg-[#070b12]/92 p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl`}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="text-amber-300" aria-hidden>
                  ✦
                </span>
                <div className="text-end">
                  <p className="text-3xl font-bold leading-none tracking-tight text-white">
                    {job.score}
                    <span className="text-base font-semibold text-white/45">
                      {' '}
                      / 100
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-white/85">
                {isAr ? 'جاهزية مقابلة' : 'Interview Readiness'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300/80">
                Muqabaleh Passport
              </p>
              <p className="mt-2 text-[10px] text-white/35">muqabaleh.com/jobs</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative z-10 border-t border-white/8 bg-black/40 py-3 backdrop-blur-md">
        <div className="overflow-hidden" dir="ltr">
          <div
            className={`flex w-max gap-10 whitespace-nowrap text-xs text-white/55 ${
              reduceMotion ? '' : 'crystal-marquee'
            }`}
          >
            {[...FEATURED_JOBS, ...FEATURED_JOBS].map((item, i) => (
              <span key={`${item.id}-${i}`} className="inline-flex items-center gap-2">
                <span className="text-cyan-300/70">●</span>
                {isAr
                  ? `${item.titleAr} — ${item.company} — ${item.locationAr}`
                  : `${item.titleEn} — ${item.company} — ${item.locationEn}`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
