'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, ShieldCheck, Mail, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { easeCrystal } from '@/components/landing/crystal/motion';
import { localePath } from '@/i18n/navigation';

/**
 * Free interviews are gated: registration (email) + pre-qualifying questions required.
 * This page no longer starts an ungated guest interview.
 */
export default function DemoContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useTranslations('demo');
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';

  const goHome = () => {
    router.push(localePath('/', locale));
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    goHome();
  };

  const BackIcon = locale === 'ar' ? ArrowRight : ArrowLeft;

  const prequalPath = localePath('/interview/prequal', locale);
  const continueHref = isAuthenticated
    ? prequalPath
    : `${localePath('/auth/register', locale)}?callbackUrl=${encodeURIComponent(prequalPath)}`;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[var(--aurora-1)]/35 blur-[100px] will-change-transform"
          animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[var(--aurora-2)]/30 blur-[110px] will-change-transform"
          animate={{ x: [0, -50, 20, 0], y: [0, -25, 35, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <header className="relative z-20 px-4 pt-4 md:px-6">
        <div className="glass mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 rounded-2xl px-3 sm:px-4">
          <Link
            href={localePath('/', locale)}
            className="group inline-flex min-w-0 items-center gap-2.5 rounded-xl py-1 pe-2 transition hover:bg-white/[0.04]"
            aria-label={t('home')}
          >
            <Image
              src="/images/logos/v2-balanced-a-T.webp"
              alt="Muqabaleh"
              width={160}
              height={44}
              className="h-10 w-auto sm:h-11"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/[0.04]"
          >
            <BackIcon className="h-4 w-4" />
            {isAr ? 'رجوع' : 'Back'}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeCrystal }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-10"
        >
          <p className="text-sm uppercase tracking-[0.18em] text-teal-300/80">Muqabaleh</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl">
            {isAr ? 'مقابلة تجريبية مجانية — بعد التأهيل' : 'Free mock interview — after pre-qual'}
          </h1>
          <p className="mt-4 max-w-xl text-[var(--text-secondary)]">
            {isAr
              ? 'لا توجد مقابلة مجانية دون التسجيل ببريدك الإلكتروني والإجابة عن أسئلة التأهيل. بعد الجلسة يمكنك تصفّح الوظائف أو دعوة صديق للتسجيل.'
              : 'There is no free interview without email registration and pre-qualifying questions. After your session you can browse jobs or invite a friend to register.'}
          </p>

          <ul className="mt-8 space-y-4">
            {[
              {
                icon: Mail,
                title: isAr ? '١) سجّل ببريدك' : '1) Register with your email',
                body: isAr
                  ? 'نحتاج بريدك لفتح جلستك المجانية وحفظ تقدّمك.'
                  : 'We need your email to unlock your free session and save progress.',
              },
              {
                icon: ClipboardList,
                title: isAr ? '٢) أجب عن أسئلة التأهيل' : '2) Answer pre-qualifying questions',
                body: isAr
                  ? '٨ أسئلة تخصّص الدور والمستوى واللغة ومدة المقابلة.'
                  : 'Eight questions tailor role, level, language, and interview length.',
              },
              {
                icon: ShieldCheck,
                title: isAr ? '٣) ابدأ المقابلة واحصل على تقرير' : '3) Start interview & get a report',
                body: isAr
                  ? 'ثم تصفّح قائمة الوظائف أو سجّل دعوة لصديق.'
                  : 'Then browse the job listing or share registration with a friend.',
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={continueHref}
              className="flex-1 rounded-xl bg-teal-300 px-5 py-3.5 text-center text-sm font-semibold text-[var(--bg-deep)]"
            >
              {isAuthenticated
                ? isAr
                  ? 'متابعة إلى التأهيل'
                  : 'Continue to pre-qual'
                : isAr
                  ? 'سجّل ثم ابدأ التأهيل'
                  : 'Register, then start pre-qual'}
            </Link>
            <Link
              href={localePath('/jobs', locale)}
              className="rounded-xl border border-white/15 px-5 py-3.5 text-center text-sm"
            >
              {isAr ? 'تصفّح الوظائف' : 'Browse jobs'}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
