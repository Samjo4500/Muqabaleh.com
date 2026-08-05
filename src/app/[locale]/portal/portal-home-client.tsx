'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { BriefcaseBusiness, Building2, UserRound } from 'lucide-react';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { localePath } from '@/i18n/navigation';

const DOORS = [
  {
    key: 'vacancies',
    href: '/portal/jobs',
    icon: BriefcaseBusiness,
    title: { en: 'Browse vacancies', ar: 'تصفّح الشواغر' },
    body: {
      en: 'Verified openings across 20 MENA countries — apply with your profile.',
      ar: 'فرص موثّقة عبر ٢٠ دولة — قدّم بملفك الشخصي.',
    },
    cta: { en: 'View vacancies', ar: 'عرض الشواغر' },
  },
  {
    key: 'talent',
    href: '/portal/jobs?tab=candidates',
    icon: UserRound,
    title: { en: 'Join the talent pool', ar: 'انضم لقاعدة المواهب' },
    body: {
      en: 'Register once. Employers discover you through interview scores and skills.',
      ar: 'سجّل مرة واحدة. تكتشفك الشركات عبر درجات مقابلتك ومهاراتك.',
    },
    cta: { en: 'Register as candidate', ar: 'سجّل كمرشّح' },
  },
  {
    key: 'employers',
    href: '/request-demo?from=portal',
    icon: Building2,
    title: { en: 'Hire on Muqabaleh', ar: 'وظّف عبر مقابلة' },
    body: {
      en: 'Post authorized vacancies and run AI screening — request a demo for console access.',
      ar: 'انشر شواغر مصرّحة وشغّل الفرز الذكي — اطلب عرضاً لتفعيل لوحة التحكم.',
    },
    cta: { en: 'Request a demo', ar: 'اطلب عرضاً توضيحياً' },
  },
] as const;

export function PortalHomeClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <AtelierShell showHeroLogo>
      <section className="mq-wrap pb-20 pt-6 md:pt-10">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold tracking-[0.2em] text-teal-300/80"
          >
            {isAr ? 'بوابة الوظائف' : 'JOB PORTAL'}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mq-display mt-3 text-4xl font-bold text-white md:text-5xl"
          >
            {isAr ? 'من التدريب إلى العرض الوظيفي' : 'From practice to offer'}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-white/60">
            {isAr
              ? 'الشواغر، قاعدة المواهب، وتوظيف الشركات — في بوابة واحدة.'
              : 'Vacancies, talent pool, and employer hiring — one portal.'}
          </motion.p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {DOORS.map((door, i) => {
            const Icon = door.icon;
            return (
              <motion.div
                key={door.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.08, duration: 0.45, ease: easeCrystal }}
                className="mq-panel flex flex-col rounded-2xl p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">
                  {isAr ? door.title.ar : door.title.en}
                </h2>
                <p className="mt-2 flex-1 text-sm text-white/55">
                  {isAr ? door.body.ar : door.body.en}
                </p>
                <Link
                  href={localePath(door.href, locale)}
                  className="mq-btn mq-btn-primary mt-6 inline-flex justify-center py-2.5 text-sm"
                >
                  {isAr ? door.cta.ar : door.cta.en}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-white/40">
          {isAr ? 'تبحث عن تدريب؟ ' : 'Looking to practice? '}
          <Link href={localePath('/demo', locale)} className="text-teal-300 hover:text-teal-200">
            {isAr ? 'ابدأ مقابلة تجريبية' : 'Start a free AI interview'}
          </Link>
          {isAr ? ' أو ' : ' or '}
          <Link
            href={localePath('/interviewers', locale)}
            className="text-teal-300 hover:text-teal-200"
          >
            {isAr ? 'احجز محاوراً بشرياً' : 'book a human coach'}
          </Link>
          .
        </p>
      </section>
    </AtelierShell>
  );
}
