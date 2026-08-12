'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FEATURED_JOBS } from '@/components/jobs/featured-jobs';
import { localePath } from '@/i18n/navigation';
import { jeanniePracticePath } from '@/lib/jobs/jeannie-practice';

type Props = {
  locale: string;
  roleCount: number;
};

/**
 * 3D flip book of ultra-HQ 1600² Job of the Day poster faces (AR ↔ EN).
 */
export function JobFlipCard({ locale, roleCount }: Props) {
  const reduceMotion = useReducedMotion();
  const [jobIndex, setJobIndex] = useState(0);
  const [showEn, setShowEn] = useState(false);
  const [paused, setPaused] = useState(false);
  const job = FEATURED_JOBS[jobIndex];
  const practiceHref = localePath(
    jeanniePracticePath({
      company: job.company,
      role: locale === 'ar' ? job.titleAr : job.titleEn,
      job: job.id,
    }),
    locale,
  );
  const jobsLabel = roleCount > 0 ? roleCount : 166;

  useEffect(() => {
    if (reduceMotion || paused) return;
    const flipId = window.setInterval(() => setShowEn((v) => !v), 4200);
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

  // Prefetch next job faces
  useEffect(() => {
    const next = FEATURED_JOBS[(jobIndex + 1) % FEATURED_JOBS.length];
    const imgs = [next.faceAr, next.faceEn, job.faceEn, job.faceAr];
    for (const src of imgs) {
      const el = new window.Image();
      el.src = src;
    }
  }, [jobIndex, job.faceAr, job.faceEn]);

  return (
    <div
      className="w-full max-w-[560px] xl:max-w-[620px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowEn((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white/85 backdrop-blur transition-colors hover:border-cyan-300/40 hover:text-white"
        >
          عربي ⇄ English
        </button>
        <p className="text-[11px] font-semibold tabular-nums text-white/45">
          {String(jobIndex + 1).padStart(2, '0')} /{' '}
          {String(FEATURED_JOBS.length).padStart(2, '0')}
        </p>
      </div>

      <div
        className="relative w-full cursor-pointer [perspective:1600px]"
        onClick={() => setShowEn((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowEn((v) => !v);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={showEn ? 'Show Arabic poster' : 'Show English poster'}
      >
        {reduceMotion ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] border border-white/12 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
            <Image
              src={showEn ? job.faceEn : job.faceAr}
              alt={
                showEn
                  ? `${job.company} — ${job.titleEn}`
                  : `${job.company} — ${job.titleAr}`
              }
              fill
              sizes="(max-width: 1024px) 92vw, 620px"
              quality={95}
              priority={jobIndex === 0}
              className="object-cover"
            />
          </div>
        ) : (
          <div
            key={job.id}
            className="relative aspect-square w-full transition-transform duration-700 [transform-style:preserve-3d]"
            style={{
              transform: showEn ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] border border-white/12 shadow-[0_30px_90px_rgba(0,0,0,0.55)] [backface-visibility:hidden]">
              <Image
                src={job.faceAr}
                alt={`${job.company} — ${job.titleAr}`}
                fill
                sizes="(max-width: 1024px) 92vw, 620px"
                quality={95}
                priority={jobIndex === 0}
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] border border-white/12 shadow-[0_30px_90px_rgba(0,0,0,0.55)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <Image
                src={job.faceEn}
                alt={`${job.company} — ${job.titleEn}`}
                fill
                sizes="(max-width: 1024px) 92vw, 620px"
                quality={95}
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        <div
          className="flex items-center justify-center gap-2"
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
        <Link
          href={practiceHref}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-300 px-6 text-sm font-bold text-[#041016] shadow-[0_0_28px_rgba(34,211,238,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          {locale === 'ar' ? 'تدرّب صوتياً مع جيني مجاناً' : 'Voice practice with Jeannie — Free'}
          <span aria-hidden>{locale === 'ar' ? '←' : '→'}</span>
        </Link>
        <p className="text-[11px] text-white/40">
          {locale === 'ar'
            ? `أكثر من ${jobsLabel} وظيفة حقيقية · الراتب لدى الشركة`
            : `${jobsLabel}+ real jobs · Salary at the company`}
        </p>
      </div>
    </div>
  );
}
