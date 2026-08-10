'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FEATURED_JOBS, type FeaturedJob } from '@/components/jobs/featured-jobs';
import { localePath } from '@/i18n/navigation';

type FaceLang = 'ar' | 'en';

function JobPosterFace({
  job,
  lang,
  practiceHref,
  jobsLabel,
}: {
  job: FeaturedJob;
  lang: FaceLang;
  practiceHref: string;
  jobsLabel: number;
}) {
  const isAr = lang === 'ar';

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#070b12]/95 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-md"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={lang}
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/90">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.85)]" />
          {isAr ? 'وظيفة اليوم' : 'Job of the Day'}
        </span>
        <span className="text-[10px] font-bold tracking-[0.12em] text-amber-200/80">
          MUQABALEH
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[0.95fr_1.05fr] gap-3 px-3 pb-3">
        {/* Jeannie column — visual left in LTR, right in RTL via dir */}
        <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={job.jeannieSrc}
            alt={isAr ? 'جيني' : 'Jeannie'}
            fill
            sizes="180px"
            className="object-cover object-[center_18%]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,8,15,0.05) 35%, rgba(5,8,15,0.88) 100%)',
            }}
            aria-hidden
          />
          <span className="absolute top-2.5 end-2.5 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {isAr ? 'تدرّب الآن' : 'Train now'}
          </span>
          <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5">
            <p className="text-sm font-bold text-white">
              {isAr ? 'جيني' : 'Jeannie'}
            </p>
            <p className="text-[9px] text-white/60">
              {isAr ? 'مدربة المقابلات AI' : 'AI Interview Coach'}
            </p>
          </div>
          <div className="absolute -bottom-1 start-2 w-[88%] rounded-xl border border-cyan-300/20 bg-[#070b12]/92 px-2.5 py-2 shadow-lg backdrop-blur-md translate-y-1">
            <div className="flex items-end justify-between gap-1">
              <span className="text-[10px] text-amber-300" aria-hidden>
                ✦
              </span>
              <p className="text-xl font-bold leading-none text-white">
                {job.score}
                <span className="text-[11px] font-semibold text-white/40">
                  {' '}
                  /100
                </span>
              </p>
            </div>
            <p className="mt-0.5 text-[9px] font-semibold text-white/80">
              {isAr ? 'جاهزية مقابلة' : 'Interview Readiness'}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-cyan-300/75">
              Muqabaleh Passport
            </p>
          </div>
        </div>

        {/* Job copy */}
        <div className="flex min-h-0 flex-col pt-1">
          <div className="mb-2 flex items-center gap-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${job.markBg}`}
              aria-hidden
            >
              {job.mark}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{job.company}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                {isAr ? 'على مقابلة' : 'On Muqabaleh'}
              </p>
            </div>
          </div>

          <h3 className="text-[clamp(1.05rem,2.4vw,1.45rem)] font-bold leading-tight text-white">
            {isAr ? job.titleAr : job.titleEn}
          </h3>
          {isAr ? (
            <p className="mt-0.5 text-[11px] text-white/45">{job.titleEn}</p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/85">
              <span aria-hidden>{job.flag}</span>
              {isAr ? job.locationAr : job.locationEn}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/80">
              <span className={`h-1.5 w-1.5 rounded-full ${job.deptDot}`} />
              {isAr ? job.deptAr : job.deptEn}
            </span>
          </div>

          <p className="mt-2.5 line-clamp-3 text-[11px] leading-relaxed text-white/65">
            {isAr ? job.blurbAr : job.blurbEn}
          </p>

          <div className="mt-auto pt-3">
            <Link
              href={practiceHref}
              className="inline-flex w-full min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 px-3 text-[11px] font-bold text-[#041016] shadow-[0_0_24px_rgba(34,211,238,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {isAr ? 'تدرّب مع جيني مجاناً' : 'Train with Jeannie — Free'}
              <span aria-hidden>{isAr ? '←' : '→'}</span>
            </Link>
            <p className="mt-2 text-[9px] leading-snug text-white/40">
              {isAr
                ? `أكثر من ${jobsLabel} وظيفة حقيقية · الراتب لدى الشركة`
                : `${jobsLabel}+ real jobs · Salary at the company`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  locale: string;
  roleCount: number;
};

/**
 * 3D flip book: Arabic front ↔ English back, auto-advance through featured jobs.
 */
export function JobFlipCard({ locale, roleCount }: Props) {
  const reduceMotion = useReducedMotion();
  const [jobIndex, setJobIndex] = useState(0);
  const [showEn, setShowEn] = useState(false);
  const [paused, setPaused] = useState(false);
  const jobsLabel = roleCount > 0 ? roleCount : 166;
  const job = FEATURED_JOBS[jobIndex];
  const practiceHref = localePath('/interview/prequal', locale);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const flipId = window.setInterval(() => {
      setShowEn((v) => !v);
    }, 4200);
    return () => window.clearInterval(flipId);
  }, [reduceMotion, paused, jobIndex]);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const advanceId = window.setInterval(() => {
      setShowEn(false);
      setJobIndex((i) => (i + 1) % FEATURED_JOBS.length);
    }, 8400);
    return () => window.clearInterval(advanceId);
  }, [reduceMotion, paused]);

  return (
    <div
      className="w-full max-w-[520px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowEn((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[11px] font-bold text-white/80 backdrop-blur transition-colors hover:border-cyan-300/40 hover:text-white"
        >
          عربي ⇄ English
        </button>
        <p className="text-[11px] font-semibold tabular-nums text-white/45">
          {String(jobIndex + 1).padStart(2, '0')} /{' '}
          {String(FEATURED_JOBS.length).padStart(2, '0')}
        </p>
      </div>

      <div
        className="block w-full cursor-pointer [perspective:1400px]"
        onClick={() => setShowEn((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowEn((v) => !v);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={
          showEn ? 'Show Arabic job poster' : 'Show English job poster'
        }
      >
        {reduceMotion ? (
          <div className="relative aspect-[16/11] w-full">
            <JobPosterFace
              job={job}
              lang={showEn ? 'en' : 'ar'}
              practiceHref={practiceHref}
              jobsLabel={jobsLabel}
            />
          </div>
        ) : (
          <div
            key={job.id}
            className="relative aspect-[16/11] w-full transition-transform duration-700 [transform-style:preserve-3d]"
            style={{
              transform: showEn ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <JobPosterFace
                job={job}
                lang="ar"
                practiceHref={practiceHref}
                jobsLabel={jobsLabel}
              />
            </div>
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <JobPosterFace
                job={job}
                lang="en"
                practiceHref={practiceHref}
                jobsLabel={jobsLabel}
              />
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-4 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Featured jobs"
      >
        {FEATURED_JOBS.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === jobIndex}
            aria-label={item.titleEn}
            onClick={() => {
              setJobIndex(i);
              setShowEn(false);
            }}
            className={`h-2 rounded-full transition-all ${
              i === jobIndex
                ? 'w-7 bg-cyan-300'
                : 'w-2 bg-white/25 hover:bg-white/45'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
