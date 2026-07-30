'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TrendingUp, DollarSign, Calendar, Upload, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SectionHeading, GlowCard } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SECTOR_OPTIONS = ['IT', 'Finance', 'HR', 'Marketing', 'Sales', 'Engineering', 'Medicine', 'Education'] as const;
const LANGUAGE_OPTIONS = ['dialectMSA', 'dialectGulf', 'dialectEnglish', 'dialectFrench'] as const;
const WHY_ICONS = [TrendingUp, DollarSign, Calendar] as const;
const WHY_TITLE_KEYS = ['why1Title', 'why2Title', 'why3Title'] as const;
const WHY_DESC_KEYS = ['why1Desc', 'why2Desc', 'why3Desc'] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function JoinAsInterviewerPage() {
  const t = useTranslations('joinInterviewer');
  const tSectors = useTranslations('interviewers');
  const [submitted, setSubmitted] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-void">
        <Navbar />
        <main className="flex flex-1 items-center justify-center pt-16">
          <div className="mx-auto max-w-lg px-4 py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald/10">
              <CheckCircle2 size={40} strokeWidth={1.75} className="text-emerald" />
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] md:text-3xl">
              <span className="gold-gradient-text">{t('submittedTitle')}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[var(--text-muted)]">{t('submittedSub')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* ── Why Join Section ── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow={t('eyebrow')} title={t('title')} sub={t('sub')} />
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {WHY_ICONS.map((Icon, idx) => (
                <GlowCard key={idx} className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gold)]/10">
                    <Icon size={24} strokeWidth={1.75} className="text-[var(--gold)]" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{t(WHY_TITLE_KEYS[idx])}</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{t(WHY_DESC_KEYS[idx])}</p>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── Application Form Section ── */}
        <section className="border-t border-white/5 py-16 md:py-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] md:text-3xl">
                <span className="gold-gradient-text">{t('formTitle')}</span>
              </h2>
              <p className="mt-3 text-[var(--text-muted)]">{t('formSub')}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <GlowCard className="space-y-6 p-6 md:p-8" style={{ transform: 'none' }}>
                {/* Arabic Bio */}
                <FieldGroup label={t('bioAr')}>
                  <Textarea
                    placeholder={t('bioArPlaceholder')}
                    className="glass-input min-h-24 border-0"
                  />
                </FieldGroup>

                {/* English Bio */}
                <FieldGroup label={t('bioEn')}>
                  <Textarea
                    placeholder={t('bioEnPlaceholder')}
                    className="glass-input min-h-24 border-0"
                  />
                </FieldGroup>

                {/* Sectors (multi-select checkboxes) */}
                <FieldGroup label={t('sectors')}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {SECTOR_OPTIONS.map((key) => {
                      const sectorLabel = tSectors(`sector${key}` as 'sectorIT');
                      const isChecked = selectedSectors.includes(key);
                      return (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-[var(--text-muted)] transition-colors has-[[data-state=checked]]:border-[var(--gold)]/40 has-[[data-state=checked]]:bg-[var(--gold)]/5 has-[[data-state=checked]]:text-[var(--gold)]"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              setSelectedSectors((prev) =>
                                checked
                                  ? [...prev, key]
                                  : prev.filter((s) => s !== key),
                              );
                            }}
                          />
                          <span className="truncate">{sectorLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                </FieldGroup>

                {/* Languages (multi-select checkboxes) */}
                <FieldGroup label={t('languages')}>
                  <div className="grid grid-cols-2 gap-3">
                    {LANGUAGE_OPTIONS.map((key) => {
                      const langLabel = tSectors(key as 'dialectMSA');
                      const isChecked = selectedLanguages.includes(key);
                      return (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-[var(--text-muted)] transition-colors has-[[data-state=checked]]:border-[var(--gold)]/40 has-[[data-state=checked]]:bg-[var(--gold)]/5 has-[[data-state=checked]]:text-[var(--gold)]"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              setSelectedLanguages((prev) =>
                                checked
                                  ? [...prev, key]
                                  : prev.filter((l) => l !== key),
                              );
                            }}
                          />
                          <span className="truncate">{langLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                </FieldGroup>

                {/* Experience Years */}
                <FieldGroup label={t('experienceYears')}>
                  <Input
                    type="number"
                    placeholder={t('experienceYearsPlaceholder')}
                    className="glass-input h-10 max-w-[200px] border-0"
                    min={0}
                  />
                </FieldGroup>

                {/* Current Title */}
                <FieldGroup label={t('currentTitle')}>
                  <Input
                    type="text"
                    placeholder={t('currentTitlePlaceholder')}
                    className="glass-input h-10 border-0"
                  />
                </FieldGroup>

                {/* Photo Upload (visual only) */}
                <FieldGroup label={t('photo')}>
                  <div className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/10 px-6 py-10 transition-colors hover:border-white/20">
                    <Upload size={28} strokeWidth={1.75} className="text-[var(--text-faint)]" />
                    <p className="text-sm text-[var(--text-faint)]">{t('photoHint')}</p>
                  </div>
                </FieldGroup>

                {/* Payment Details */}
                <FieldGroup label={t('paymentDetails')}>
                  <Textarea
                    placeholder={t('paymentDetailsPlaceholder')}
                    className="glass-input min-h-20 border-0"
                  />
                </FieldGroup>

                {/* Agreement */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreement"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="agreement" className="cursor-pointer text-sm text-[var(--text-muted)] leading-relaxed">
                    {t('agreement')}
                  </Label>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button type="submit" className="btn-gold w-full text-center">
                    {t('submitButton')}
                  </button>
                </div>
              </GlowCard>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
