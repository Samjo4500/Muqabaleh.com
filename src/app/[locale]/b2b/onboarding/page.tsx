'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const INDUSTRIES = ['sectorTech', 'sectorFinance', 'sectorHealthcare', 'sectorEducation', 'sectorEngineering', 'sectorMarketing', 'sectorHr', 'sectorOther'] as const;
const COUNTRIES = ['countrySaudi', 'countryUAE', 'countryQatar', 'countryBahrain', 'countryKuwait', 'countryOman', 'countryJordan', 'countryEgypt', 'countryOther'] as const;
const SIZES = ['sizeSmall', 'sizeMedium', 'sizeLarge'] as const;

const PLANS = [
  { key: 'planStarter', credits: 'planStarterCredits', price: 'planStarterPrice', desc: 'planStarterDesc' },
  { key: 'planBusiness', credits: 'planBusinessCredits', price: 'planBusinessPrice', desc: 'planBusinessDesc' },
  { key: 'planEnterprise', credits: 'planEnterpriseCredits', price: 'planEnterprisePrice', desc: 'planEnterpriseDesc' },
] as const;

export default function OnboardingPage() {
  const t = useTranslations('b2b.onboarding');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    country: '',
    companySize: '',
    plan: 'planBusiness',
    emails: [''],
  });

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addEmail = () => {
    if (form.emails.length < 10) {
      setForm((prev) => ({ ...prev, emails: [...prev.emails, ''] }));
    }
  };

  const removeEmail = (i: number) => {
    setForm((prev) => ({
      ...prev,
      emails: prev.emails.filter((_, idx) => idx !== i),
    }));
  };

  const updateEmail = (i: number, val: string) => {
    setForm((prev) => ({
      ...prev,
      emails: prev.emails.map((e, idx) => (idx === i ? val : e)),
    }));
  };

  const handleFinish = () => {
    toast.success(tCommon('save'));
  };

  const progressSteps = ['progressStep1', 'progressStep2', 'progressStep3'];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-4 py-12">
      <div className="aurora-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 2L26 8v12l-12 6-12-6V8l12-6z" stroke="#D4A843" strokeWidth="1.5" fill="none" />
              <path d="M14 8l6 3v6l-6 3-6-3v-6l6-3z" fill="#D4A843" opacity="0.2" />
              <circle cx="14" cy="14" r="2" fill="#D4A843" />
            </svg>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex items-center gap-2">
          {progressSteps.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center gap-2">
                <div
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    i + 1 <= step ? 'bg-indigo-500' : 'bg-white/10'
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  i + 1 === step ? 'text-[var(--aurora-2)]' : 'text-[var(--text-faint)]'
                }`}
              >
                {t(s)}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">
                  {t('step1Title')}
                </h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t('step1Sub')}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[var(--text-muted)]">{t('companyName')}</Label>
                  <Input
                    value={form.companyName}
                    onChange={(e) => updateForm('companyName', e.target.value)}
                    placeholder={t('companyNamePlaceholder')}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-[var(--text-muted)]">{t('industry')}</Label>
                  <Select value={form.industry} onValueChange={(v) => updateForm('industry', v)}>
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder={t('industryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {tAuth(ind)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-[var(--text-muted)]">{t('country')}</Label>
                  <Select value={form.country} onValueChange={(v) => updateForm('country', v)}>
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder={t('countryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {tAuth(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-[var(--text-muted)]">{t('companySize')}</Label>
                  <Select value={form.companySize} onValueChange={(v) => updateForm('companySize', v)}>
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">
                  {t('step2Title')}
                </h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t('step2Sub')}</p>
              </div>

              <div className="space-y-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => updateForm('plan', plan.key)}
                    className={`w-full rounded-xl border p-4 text-start transition-all cursor-pointer ${
                      form.plan === plan.key
                        ? 'border-indigo-400/50 bg-indigo-500/10'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                            form.plan === plan.key ? 'border-indigo-400/50' : 'border-white/20'
                          }`}
                        >
                          {form.plan === plan.key && (
                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                          )}
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">
                          {t(plan.key)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[var(--aurora-2)]">{t(plan.price)}</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{t(plan.desc)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-[var(--text-faint)]">{t('initialCredits')}:</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{t(plan.credits)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">
                  {t('step3Title')}
                </h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t('step3Sub')}</p>
              </div>

              <div className="space-y-3">
                {form.emails.map((email, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={email}
                      onChange={(e) => updateEmail(i, e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className="glass-input"
                    />
                    {form.emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmail(i)}
                        className="shrink-0 rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label={t('removeMember')}
                      >
                        <X size={18} strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                ))}
                {form.emails.length < 10 && (
                  <button
                    type="button"
                    onClick={addEmail}
                    className="flex items-center gap-2 text-sm text-[var(--aurora-2)] transition-colors hover:text-cyan-300"
                  >
                    <Plus size={16} strokeWidth={1.75} />
                    {t('addMember')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-[var(--text-muted)] hover:text-[var(--aurora-2)] cursor-pointer"
              >
                {t('back')}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {step === 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleFinish}
                  className="text-[var(--text-muted)] hover:text-[var(--aurora-2)] cursor-pointer"
                >
                  {t('skip')}
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="glass-button cursor-pointer"
                >
                  {t('next')}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinish}
                  className="glass-button flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={18} strokeWidth={1.75} />
                  {t('finish')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
