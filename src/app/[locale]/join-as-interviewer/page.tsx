'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                   */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function JoinAsInterviewerPage() {
  const t = useTranslations('joinInterviewer');
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
    <div className="flex min-h-screen flex-col bg-[var(--bg-void)]">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* ── Hero ── */}
          <section className="py-20 text-center md:py-28">
            <h1 className="text-4xl font-bold text-[var(--gold)] md:text-5xl">
              {t('heroHeadline')}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-white">
              {t('heroSubtext')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-white">
                <DollarSign size={20} strokeWidth={1.75} className="text-[var(--gold)]" />
                <span>{t('statEarnings')}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Calendar size={20} strokeWidth={1.75} className="text-[var(--gold)]" />
                <span>{t('statSchedule')}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CreditCard size={20} strokeWidth={1.75} className="text-[var(--gold)]" />
                <span>{t('statFree')}</span>
              </div>
            </div>
          </section>

          {/* ── How It Works ── */}
          <section className="mt-24">
            <h2 className="text-center text-3xl font-bold text-white">
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
                  className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#0B0F17] p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)] text-sm font-bold text-black">
                    {step.num}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    {t(step.descKey)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ── Requirements ── */}
          <section className="mt-24">
            <h2 className="text-3xl font-bold text-white">
              {t('requirementsTitle')}
            </h2>
            <ul className="mt-6 space-y-3">
              {requirementKeys.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    strokeWidth={1.75}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span className="text-white">{t(key)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Earnings Calculator ── */}
          <section className="mt-24">
            <h2 className="text-center text-3xl font-bold text-white">
              {t('calculatorTitle')}
            </h2>
            <p className="mt-3 text-center text-[var(--text-muted)]">
              {t('sessionsPerWeek')}
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#0B0F17] p-6">
              {/* Slider */}
              <input
                type="range"
                min={1}
                max={20}
                value={sessions}
                onChange={(e) => setSessions(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#d4af37]"
                aria-label={t('sessionsPerWeek')}
              />
              <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
                {sessions} × $29 × 4 {t('perMonth')}
              </p>

              {/* Calculation display */}
              <div className="mt-6 space-y-3 border-t border-white/5 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">
                    {sessions * 4} sessions × $29
                  </span>
                  <span className="text-[var(--gold)] font-semibold">
                    ${grossMonthly.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">
                    {t('platformFee')} (20%)
                  </span>
                  <span className="text-red-400">
                    -${platformFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-white font-semibold">{t('youEarn')}</span>
                  <span className="text-2xl font-bold text-[var(--gold)]">
                    ${netMonthly.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="mt-16 pb-4 text-center">
            <Link
              href="/apply"
              className="inline-block rounded-xl bg-[#d4af37] px-12 py-4 text-lg font-bold text-black transition-all hover:brightness-110"
            >
              {t('applyCta')}
            </Link>
          </section>

          {/* ── FAQ ── */}
          <section className="mt-24 pb-20">
            <Accordion type="single" collapsible className="w-full">
              {faqKeys.map(({ q, a }, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border-[rgba(212,175,55,0.2)]"
                >
                  <AccordionTrigger className="text-white hover:no-underline hover:text-[var(--gold)]">
                    {t(q)}
                  </AccordionTrigger>
                  <AccordionContent className="text-[var(--text-muted)]">
                    {t(a)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
