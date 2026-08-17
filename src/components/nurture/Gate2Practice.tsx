'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GATE2, cityOptions, experienceOptions, languageOptions } from '@/lib/nurture/copy';
import { trackGaEvent } from '@/lib/analytics-ga';
import {
  GateField,
  GateShell,
  gateCtaClass,
  gateInputClass,
} from './GateShell';
import { readNurture, writeNurture } from './gate-storage';

type Props = {
  open: boolean;
  isAr: boolean;
  locale: string;
  href: string;
  role?: string;
  company?: string;
  jobId?: string;
  onClose: () => void;
};

export function Gate2Practice({
  open,
  isAr,
  locale,
  href,
  role,
  company,
  jobId,
  onClose,
}: Props) {
  const router = useRouter();
  const copy = isAr ? GATE2.ar : GATE2.en;
  const stored = useMemo(() => readNurture(), [open]);
  const [email, setEmail] = useState(stored.email || '');
  const [fullName, setFullName] = useState(stored.fullName || '');
  const [yearsExperience, setYearsExperience] = useState(stored.yearsExperience || '');
  const [preferredLanguage, setPreferredLanguage] = useState(
    stored.preferredLanguage || (locale === 'ar' ? 'AR' : 'EN'),
  );
  const [currentCity, setCurrentCity] = useState(stored.currentCity || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const validate = (requireAll: boolean) => {
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = copy.invalidEmail;
    if (requireAll) {
      if (fullName.trim().length < 2) next.fullName = copy.required;
      if (!yearsExperience) next.yearsExperience = copy.required;
      if (!preferredLanguage) next.preferredLanguage = copy.required;
      if (!currentCity) next.currentCity = copy.required;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const start = async () => {
    if (!validate(true)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/nurture/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gate2',
          email,
          fullName,
          yearsExperience,
          preferredLanguage,
          currentCity,
          role,
          company,
          jobId,
          href,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; token?: string };
      if (!res.ok || !data.ok) {
        setErrors({ email: copy.invalidEmail });
        return;
      }
      writeNurture({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        yearsExperience,
        preferredLanguage,
        currentCity,
        practiceReady: true,
        token: data.token,
      });
      trackGaEvent('nurture_gate2_start', {
        company: company || '',
        role: role || '',
      });
      router.push(href);
    } finally {
      setBusy(false);
    }
  };

  const saveRole = async () => {
    if (!validate(false)) {
      setErrors({ email: copy.saveNeedsEmail });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/nurture/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_role',
          email,
          fullName,
          currentCity,
          role,
          company,
          jobId,
          href,
        }),
      });
      if (res.ok) {
        writeNurture({
          email: email.trim().toLowerCase(),
          fullName: fullName.trim() || undefined,
          token: ((await res.json()) as { token?: string }).token,
        });
        setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <GateShell isAr={isAr}>
      <button
        type="button"
        onClick={onClose}
        className="mb-2 text-xs text-white/40 hover:text-white/70"
      >
        {isAr ? 'إغلاق' : 'Close'}
      </button>
      <span className="inline-flex items-center gap-2 rounded-full border border-[#00D4AA]/40 bg-[#00D4AA]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#00D4AA]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00D4AA]" />
        {copy.badge}
      </span>
      <h2 className="mt-4 text-[26px] font-extrabold leading-tight text-white">
        {copy.headline(role || (isAr ? 'هذه الوظيفة' : 'this role'), company || '')}
      </h2>
      <p className="mt-2 text-sm text-white/40">{copy.subhead}</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void start();
        }}
      >
        <GateField label={copy.email} error={errors.email}>
          <input
            className={gateInputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.emailPh}
            autoComplete="email"
          />
        </GateField>
        <GateField label={copy.name} error={errors.fullName}>
          <input
            className={gateInputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={copy.namePh}
            autoComplete="name"
          />
        </GateField>
        <GateField label={copy.experience} error={errors.yearsExperience}>
          <select
            className={gateInputClass}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
          >
            <option value="">{isAr ? 'اختر' : 'Select'}</option>
            {experienceOptions(isAr).map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </GateField>
        <GateField label={copy.language} error={errors.preferredLanguage}>
          <select
            className={gateInputClass}
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
          >
            {languageOptions(isAr).map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </GateField>
        <GateField label={copy.city} error={errors.currentCity}>
          <select
            className={gateInputClass}
            value={currentCity}
            onChange={(e) => setCurrentCity(e.target.value)}
          >
            <option value="">{isAr ? 'اختر مدينة' : 'Select a city'}</option>
            {cityOptions(isAr).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </GateField>
        <button type="submit" disabled={busy} className={gateCtaClass}>
          {busy ? copy.sending : copy.cta}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveRole()}
          className="w-full text-center text-sm text-white/45 underline-offset-2 hover:text-white/70 hover:underline"
        >
          {saved ? copy.saved : copy.save}
        </button>
      </form>
    </GateShell>
  );
}
