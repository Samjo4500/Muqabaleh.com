'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { localePath } from '@/i18n/navigation';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function JoinAsInterviewerPage() {
  const t = useTranslations('joinInterviewer');
  const locale = useLocale();
  const [sessions, setSessions] = useState(5);

  const grossMonthly = sessions * 29 * 4;
  const platformFee = grossMonthly * 0.2;
  const netMonthly = grossMonthly * 0.8;

  const faqKeys = [
    { q: 'faq1q', a: 'faq1a' },
    { q: 'faq2q', a: 'faq2a' },
    { q: 'faq3q', a: 'faq3a' },
    { q: 'faq4q', a: 'faq4a' },
    { q: 'faq5q', a: 'faq5a' },
  ] as const;

  const requirementKeys = ['req1', 'req2', 'req3', 'req4'] as const;

  const steps = [
    { num: 1, titleKey: 'step1Title', descKey: 'step1Desc' },
    { num: 2, titleKey: 'step2Title', descKey: 'step2Desc' },
    { num: 3, titleKey: 'step3Title', descKey: 'step3Desc' },
  ] as const;

  return (
    <AtelierShell showHeroLogo>
      <div className="mq-wrap pb-20">
        <section className="py-16 text-center md:py-24">
          <h1 className="mq-display text-4xl font-bold text-white md:text-5xl">
            {t('heroHeadline')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70 md:text-xl">
            {t('heroSubtext')}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-white/85">
              <DollarSign size={20} strokeWidth={1.75} className="text-teal-300" />
              <span>{t('statEarnings')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/85">
              <Calendar size={20} strokeWidth={1.75} className="text-teal-300" />
              <span>{t('statSchedule')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/85">
              <CreditCard size={20} strokeWidth={1.75} className="text-teal-300" />
              <span>{t('statFree')}</span>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mq-display text-center text-3xl font-bold text-white">
            {t('howTitle')}
          </h2>
          <motion.div
            className="mt-10 grid gap-6 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={itemVariants}
                className="mq-panel rounded-2xl p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-300 text-sm font-bold text-[#070b14]">
                  {step.num}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  {t(step.descKey)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="mt-24">
          <h2 className="mq-display text-3xl font-bold text-white">
            {t('requirementsTitle')}
          </h2>
          <ul className="mt-6 space-y-3">
            {requirementKeys.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  strokeWidth={1.75}
                  className="mt-0.5 shrink-0 text-teal-300"
                />
                <span className="text-white/85">{t(key)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24">
          <h2 className="mq-display text-center text-3xl font-bold text-white">
            {t('calculatorTitle')}
          </h2>
          <p className="mt-3 text-center text-white/55">
            {t('sessionsPerWeek')}
          </p>

          <div className="mq-panel mx-auto mt-8 max-w-md rounded-2xl p-6">
            <input
              type="range"
              min={1}
              max={20}
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value))}
              className="w-full cursor-pointer accent-teal-300"
              aria-label={t('sessionsPerWeek')}
            />
            <p className="mt-2 text-center text-sm text-white/55">
              {sessions} × $29 × 4 {t('perMonth')}
            </p>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/55">
                  {sessions * 4} sessions × $29
                </span>
                <span className="font-semibold text-[var(--mq-sand)]">
                  ${grossMonthly.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/55">
                  {t('platformFee')} (20%)
                </span>
                <span className="text-rose-300">
                  -${platformFee.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="font-semibold text-white">{t('youEarn')}</span>
                <span className="text-2xl font-bold text-teal-300">
                  ${netMonthly.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 pb-4 text-center">
          <Link href={localePath('/apply', locale)} className="mq-btn mq-btn-primary px-12 py-4 text-lg">
            {t('applyCta')}
          </Link>
        </section>

        <section className="mt-24">
          <Accordion type="single" collapsible className="w-full">
            {faqKeys.map(({ q, a }, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-white/12"
              >
                <AccordionTrigger className="text-white hover:text-teal-300 hover:no-underline">
                  {t(q)}
                </AccordionTrigger>
                <AccordionContent className="text-white/55">
                  {t(a)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </AtelierShell>
  );
}
