'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { SectionHeading, GlowCard } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SupportPage() {
  const t = useTranslations('support');
  const tLanding = useTranslations('landing');
  const tc = useTranslations('common');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubject('');
    setMessage('');
    toast.success(t('sent'));
  };

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* ── Header ── */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold md:text-4xl">
              <span className="gold-gradient-text">{t('title')}</span>
            </h1>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('faq')}
              title={t('faq')}
              titleHighlight={t('faq')}
            />
            <Accordion type="single" collapsible className="mt-12">
              {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                <AccordionItem key={n} value={`faq-${n}`} className="border-white/5">
                  <AccordionTrigger className="text-start text-sm font-medium text-[var(--text-primary)] hover:no-underline">
                    {tLanding(`faqQ${n}`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-[var(--text-muted)]">
                    {tLanding(`faqA${n}`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Contact Form ── */}
        <section id="contact" className="border-t border-white/5 py-16">
          <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('contactForm')}
              title={t('contactForm')}
              titleHighlight={t('contactForm')}
            />

            <GlowCard className="mt-10 p-6" style={{ transform: 'none' }}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                    {t('subject')}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="glass-input w-full px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                    {t('message')}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="glass-input w-full resize-none px-4 py-3 text-sm"
                  />
                </div>
                <button type="submit" className="btn-gold mt-2 text-sm">
                  {t('send')}
                </button>
              </form>
            </GlowCard>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
