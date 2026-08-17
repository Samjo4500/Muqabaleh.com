'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { GATE1, cityOptions } from '@/lib/nurture/copy';
import { trackGaEvent } from '@/lib/analytics-ga';
import {
  GateField,
  GateShell,
  gateCtaClass,
  gateInputClass,
  gateSecondaryClass,
  scoreBarColor,
} from './GateShell';
import { readNurture, writeNurture } from './gate-storage';

export type Gate1Score = {
  overallScore: number;
  grade?: string;
  competencyBreakdown?: { name: string; score: number }[];
  strengths?: string[];
  improvements?: string[];
};

type Props = {
  open: boolean;
  isAr: boolean;
  locale: string;
  score?: Gate1Score | null;
  role?: string;
  company?: string;
  onUnlocked: () => void;
  onClose?: () => void;
};

export function Gate1Passport({
  open,
  isAr,
  locale,
  score,
  role,
  company,
  onUnlocked,
  onClose,
}: Props) {
  const copy = isAr ? GATE1.ar : GATE1.en;
  const stored = useMemo(() => readNurture(), [open]);
  const [fullName, setFullName] = useState(stored.fullName || '');
  const [email, setEmail] = useState(stored.email || '');
  const [currentCity, setCurrentCity] = useState(stored.currentCity || '');
  const [companyName, setCompanyName] = useState(stored.company || '');
  const [phone, setPhone] = useState(stored.phone || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const validate = () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = copy.required;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = copy.invalidEmail;
    if (!currentCity) next.currentCity = copy.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const competencies = Object.fromEntries(
        (score?.competencyBreakdown || []).map((c) => [c.name, c.score]),
      );
      const res = await fetch('/api/nurture/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gate1',
          fullName,
          email,
          currentCity,
          company: companyName,
          phone,
          role,
          jobCompany: company,
          overallScore: score?.overallScore,
          strengths: score?.strengths,
          improvements: score?.improvements,
          competencies,
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
        currentCity,
        company: companyName,
        phone,
        unlocked: true,
        token: data.token,
      });
      trackGaEvent('nurture_gate1_unlocked', { city: currentCity });
      setSuccess(true);
      onUnlocked();
    } finally {
      setBusy(false);
    }
  };

  return (
    <GateShell isAr={isAr} label={success ? copy.successHeadline : copy.headline} onClose={onClose}>
      <div className="mb-5 flex justify-center">
        {success ? (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00D4AA]/15 text-[#00D4AA] shadow-[0_0_24px_rgba(0,212,170,0.35)]">
            <Check size={22} />
          </span>
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A84C]/15 text-[#C9A84C]">
            <Lock size={20} />
          </span>
        )}
      </div>
      <h2 className="text-center text-[28px] font-extrabold leading-tight text-white">
        {success ? copy.successHeadline : copy.headline}
      </h2>
      {!success ? (
        <p className="mt-2 text-center text-sm text-white/40">{copy.subhead}</p>
      ) : null}

      {success && score ? (
        <div className="mt-6">
          <p className="text-center text-5xl font-black text-[#C9A84C]">
            {score.overallScore}
            <span className="text-lg font-bold text-white/70"> / 100</span>
          </p>
          <ul className="mt-5 space-y-3">
            {(score.competencyBreakdown || []).map((c) => (
              <li key={c.name}>
                <div className="mb-1 flex justify-between text-xs text-white/60">
                  <span>{c.name}</span>
                  <span>{c.score}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full ${scoreBarColor(c.score)}`}
                    style={{ width: `${Math.max(0, Math.min(100, c.score))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00D4AA]">
                {isAr ? 'نقاط القوة' : 'Strengths'}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-white/75">
                {(score.strengths || []).slice(0, 2).map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#C9A84C]">
                {isAr ? 'للتحسين' : 'To improve'}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-white/75">
                {(score.improvements || []).slice(0, 2).map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <Link
              href={localePath(
                '/interview/prep?utm_source=gate&utm_medium=modal&utm_campaign=gate1&utm_content=practice_again',
                locale,
              )}
              className={gateCtaClass}
            >
              {copy.practiceAgain}
            </Link>
            <Link
              href={localePath(
                '/jobs?utm_source=gate&utm_medium=modal&utm_campaign=gate1&utm_content=browse_roles',
                locale,
              )}
              className={gateSecondaryClass}
            >
              {copy.browseRoles}
            </Link>
          </div>
        </div>
      ) : (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <GateField label={copy.name} error={errors.fullName}>
            <input
              className={gateInputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={copy.namePh}
              autoComplete="name"
            />
          </GateField>
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
          <GateField label={copy.company}>
            <input
              className={gateInputClass}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={copy.companyPh}
            />
          </GateField>
          <GateField label={copy.phone}>
            <input
              className={gateInputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={copy.phonePh}
              autoComplete="tel"
            />
          </GateField>
          <button type="submit" disabled={busy} className={gateCtaClass}>
            {busy ? copy.sending : copy.cta}
          </button>
          <Link
            href={localePath(
              '/jobs?utm_source=gate&utm_medium=modal&utm_campaign=gate1&utm_content=skip',
              locale,
            )}
            className="block text-center text-sm text-white/45 underline-offset-2 hover:text-white/70 hover:underline"
          >
            {copy.skip}
          </Link>
          <p className="text-center text-xs text-white/40">{copy.trust}</p>
        </form>
      )}
    </GateShell>
  );
}
