'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';

type DialogLang = 'en' | 'ar';

type Props = {
  roleCount?: number;
};

const DIALOG_EN =
  "Hi there! I'm Jeannie, your bilingual AI recruiter. Tell me about a complex project decision you had to make end-to-end. I'll listen, grade your communication structure, and issue your verified Hire-Ready Passport.";

const DIALOG_AR =
  'أهلاً بك! أنا جيني، مسؤولة التوظيف الذكية. أخبرني عن قرار مشروع معقد قمت باتخاذه من البداية إلى النهاية. سأقوم بتقييم هيكلية تواصلك وإصدار جواز سفرك المهني الموثق.';

/**
 * Jobs hero with Jeannie practice simulator — bilingual typed dialog,
 * voice meter, and CTAs into prequal + register.
 */
export function MuqabalehJobsHero({ roleCount = 0 }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [dialogLang, setDialogLang] = useState<DialogLang>(
    locale === 'ar' ? 'ar' : 'en',
  );
  const [isRecording, setIsRecording] = useState(false);
  const [animatedText, setAnimatedText] = useState('');

  useEffect(() => {
    setDialogLang(locale === 'ar' ? 'ar' : 'en');
  }, [locale]);

  useEffect(() => {
    const text = dialogLang === 'en' ? DIALOG_EN : DIALOG_AR;
    let index = 0;
    setAnimatedText('');

    const interval = window.setInterval(() => {
      index += 1;
      setAnimatedText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, 22);

    return () => window.clearInterval(interval);
  }, [dialogLang]);

  const subEn =
    roleCount > 0
      ? `Your bilingual career agent for MENA. Practice with Jeannie, earn a Hire-Ready Passport, then browse ${roleCount}+ live roles.`
      : 'Your bilingual career agent for MENA. Practice with Jeannie, earn a Hire-Ready Passport, then apply to live roles.';

  const subAr =
    roleCount > 0
      ? `وكيلك المهني الثنائي اللغة لمنطقة الشرق الأوسط. تتمرن مع جيني، تحصل على جوازك المهني الموثق، ثم تستعرض أكثر من ${roleCount} وظيفة حقيقية.`
      : 'وكيلك المهني الثنائي اللغة لمنطقة الشرق الأوسط. تتمرن مع جيني، تحصل على جوازك المهني الموثق، ثم تقدّم على وظائف حقيقية.';

  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-[#05080f]">
      <Image
        src="/images/hero-interview.webp"
        alt={isAr ? 'جيني — مقابلة ذكية' : 'Jeannie — AI interview'}
        fill
        priority
        sizes="100vw"
        quality={68}
        className="object-cover object-[center_28%] opacity-45"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, rgba(5,8,15,0.94) 0%, rgba(5,8,15,0.72) 48%, rgba(5,8,15,0.55) 100%), linear-gradient(180deg, rgba(5,8,15,0.25) 0%, rgba(5,8,15,0.88) 100%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-[15%] top-[-10%] h-[420px] w-[420px] rounded-full bg-teal-400/10 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[10%] bottom-[-12%] h-[480px] w-[480px] rounded-full bg-cyan-500/10 blur-[130px]"
        aria-hidden
      />

      <div className="mq-wrap relative z-10 flex min-h-[92svh] flex-col items-center justify-center py-24 md:py-28">
        <div
          className="mb-8 flex gap-1 rounded-full border border-white/10 bg-black/35 p-1 backdrop-blur-md"
          role="group"
          aria-label={isAr ? 'لغة حوار جيني' : 'Jeannie dialog language'}
        >
          <button
            type="button"
            onClick={() => setDialogLang('en')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              dialogLang === 'en'
                ? 'bg-teal-400 text-[#041016]'
                : 'text-white/55 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setDialogLang('ar')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              dialogLang === 'ar'
                ? 'bg-teal-400 text-[#041016]'
                : 'text-white/55 hover:text-white'
            }`}
          >
            عربي
          </button>
        </div>

        <div className="mb-7">
          <BrandLogo size="hero" priority />
        </div>

        <div className="mb-10 max-w-3xl text-center">
          <h1 className="mq-display text-[clamp(2.2rem,6.5vw,4.2rem)] font-bold leading-[1.02] tracking-tight text-white">
            {dialogLang === 'en' ? (
              <>
                Let <span className="text-teal-300">Jeannie</span> interview you.
                <br />
                Then get recruited.
              </>
            ) : (
              <>
                دع <span className="text-teal-300">جيني</span> تختبر مهاراتك.
                <br />
                ثم ابدأ مسيرتك المهنية.
              </>
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            {dialogLang === 'en' ? subEn : subAr}
          </p>
        </div>

        <div className="mb-10 w-full max-w-4xl border border-white/10 bg-black/40 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-7">
          <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-12">
            <div className="flex flex-col gap-4 md:col-span-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-400 text-sm font-bold text-[#041016]">
                  J
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Jeannie جيني</h3>
                  <p className="text-xs text-teal-300">
                    {dialogLang === 'en' ? 'AI Recruiter · Active' : 'مسؤولة توظيف ذكية · نشطة'}
                  </p>
                </div>
              </div>

              <div className="flex min-h-[150px] flex-col justify-between border border-white/8 bg-[#090a0f]/80 p-5">
                <p
                  className="text-sm font-medium leading-relaxed text-white/90 md:text-base"
                  dir={dialogLang === 'ar' ? 'rtl' : 'ltr'}
                  lang={dialogLang}
                >
                  {animatedText}
                  <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-teal-300 align-middle" />
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                  <span className="text-xs text-white/40">
                    {dialogLang === 'en'
                      ? 'Language mode: English'
                      : 'لغة المحادثة: العربية'}
                  </span>
                  <span className="text-xs font-bold text-teal-300">
                    {isRecording
                      ? dialogLang === 'en'
                        ? '● Recording…'
                        : '● جاري التسجيل…'
                      : dialogLang === 'en'
                        ? '● Listening…'
                        : '● تستمع…'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border border-white/8 bg-[#090a0f]/80 p-6 md:col-span-5">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                {dialogLang === 'en' ? 'Live voice meter' : 'مقياس الصوت المباشر'}
              </p>

              <div
                className="mb-6 flex h-16 items-center justify-center gap-1.5"
                aria-hidden
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((val, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-full bg-gradient-to-t from-teal-500 to-cyan-300 transition-all duration-300 ${
                      isRecording ? 'animate-bounce' : 'h-3 opacity-30'
                    }`}
                    style={{
                      height: isRecording ? `${val * 8}px` : '12px',
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsRecording((v) => !v)}
                aria-pressed={isRecording}
                aria-label={
                  isRecording
                    ? dialogLang === 'en'
                      ? 'Stop practice recording'
                      : 'إيقاف التسجيل'
                    : dialogLang === 'en'
                      ? 'Start practice recording'
                      : 'بدء التسجيل'
                }
                className={`flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all duration-300 ${
                  isRecording
                    ? 'animate-pulse border-red-400 bg-red-500/20'
                    : 'border-[#0b121c] bg-teal-400 hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <span className="h-5 w-5 rounded-sm bg-red-400" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-[#041016]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </button>

              <p className="mt-4 text-center text-xs font-bold text-white/55">
                {isRecording
                  ? dialogLang === 'en'
                    ? 'Recording… click to stop'
                    : 'جاري التسجيل… اضغط للتوقف'
                  : dialogLang === 'en'
                    ? 'Click microphone to practice'
                    : 'اضغط على المايكروفون للتمرن'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={localePath('/interview/prequal', locale)}
            className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[52px] w-full items-center justify-center px-7 text-sm font-bold sm:w-auto"
          >
            {dialogLang === 'en'
              ? 'Start free practice session'
              : 'ابدأ جلسة تدريب مجانية'}
          </Link>
          <a
            href="#roles"
            className="mq-btn mq-btn-on-dark-ghost inline-flex min-h-[52px] w-full items-center justify-center px-7 text-sm font-bold sm:w-auto"
          >
            {dialogLang === 'en'
              ? roleCount > 0
                ? `Browse ${roleCount}+ roles`
                : 'Browse roles'
              : roleCount > 0
                ? `استعرض ${roleCount}+ وظيفة`
                : 'استعرض الوظائف'}
          </a>
          <Link
            href={localePath('/auth/register', locale)}
            className="inline-flex min-h-[52px] w-full items-center justify-center border border-white/15 px-7 text-sm font-bold text-white/75 transition-colors hover:border-teal-300/50 hover:text-white sm:w-auto"
          >
            {dialogLang === 'en'
              ? 'Register verified passport'
              : 'تسجيل جواز السفر الموثق'}
          </Link>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05080f] to-transparent"
        aria-hidden
      />
    </section>
  );
}
