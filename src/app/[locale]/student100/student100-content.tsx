'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { Student100Hero } from '@/components/student100/Student100Hero';
import { localePath } from '@/i18n/navigation';
import { MENA_COUNTRIES } from '@/lib/constants';
import { S100, type Bi } from '@/lib/student100/copy';
import { STUDENT100_START_AT } from '@/lib/student100/constants';
import type { Student100Mine, Student100PublicStatus } from '@/lib/student100/types';

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

function formatStart(locale: string) {
  try {
    return STUDENT100_START_AT.toLocaleString(locale === 'ar' ? 'ar' : 'en-GB', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Riyadh',
    });
  } catch {
    return '20 Aug 2026, 00:00';
  }
}

type StatusPayload = Student100PublicStatus & {
  signedIn?: boolean;
  mine?: Student100Mine;
};

export default function Student100Content({ initial }: { initial: Student100PublicStatus }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [data, setData] = useState<StatusPayload>(initial);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    country: '',
    university: '',
    major: '',
    eligibility: 'CURRENT_STUDENT',
    universityEmail: '',
    proofNote: '',
  });

  useEffect(() => {
    void fetch('/api/student100/status')
      .then((r) => r.json())
      .then((json: StatusPayload) => setData(json))
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const signedIn = data.signedIn === true;

  const remainingLabel = useMemo(() => {
    if (data.soldOut) return pick(S100.claimed, locale);
    return `${data.remaining} / ${data.cap}`;
  }, [data.cap, data.remaining, data.soldOut, locale]);

  const callback = encodeURIComponent(localePath('/student100', locale));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/student100/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, locale: isAr ? 'ar' : 'en' }),
      });
      const json = (await res.json()) as { error?: string; status?: string };
      if (res.status === 401) {
        window.location.href = localePath(`/auth/register?callbackUrl=${callback}`, locale);
        return;
      }
      if (!res.ok) {
        if (json.error === 'already') setError(pick(S100.already, locale));
        else if (json.error === 'sold_out') setError(pick(S100.soldOut, locale));
        else setError(pick(S100.error, locale));
        return;
      }
      const again = await fetch('/api/student100/status').then((r) => r.json());
      setData(again);
    } catch {
      setError(pick(S100.error, locale));
    } finally {
      setBusy(false);
    }
  };

  const mine = data.mine;

  return (
    <AtelierShell>
      <Student100Hero
        offer={pick(S100.heroOffer, locale)}
        cta={pick(S100.heroCta, locale)}
        ctaHref="#s100-apply"
      />
      <section className="mq-section pb-8 pt-6">
        <div className="mq-wrap mx-auto max-w-3xl text-center">
          <p className="mq-kicker mb-3">{pick(S100.kicker, locale)}</p>
          <h1 className="mq-display mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {pick(S100.h1, locale)}
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            {pick(S100.sub, locale)}
          </p>
          <p className="text-sm text-teal-200/90">{pick(S100.notPro, locale)}</p>
        </div>
      </section>

      <section className="mq-section border-t border-white/10 pt-0">
        <div className="mq-wrap mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-wide text-white/45">{pick(S100.remaining, locale)}</p>
            <p className="mt-2 text-3xl font-bold text-teal-200">{remainingLabel}</p>
            <p className="mt-3 text-sm text-white/50">
              {pick(S100.startLabel, locale)}: {formatStart(locale)} (Asia/Riyadh)
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="mb-3 text-sm font-semibold text-white">{pick(S100.bulletsTitle, locale)}</p>
            <ul className="space-y-2 text-sm text-white/70">
              {S100.bullets.map((b) => (
                <li key={b.en}>• {pick(b, locale)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="s100-apply" className="mq-section scroll-mt-24 border-t border-white/10">
        <div className="mq-wrap mx-auto max-w-xl">
          <h2 className="mq-display mb-2 text-2xl text-white">{pick(S100.formTitle, locale)}</h2>
          <p className="mb-6 text-sm text-white/55">{pick(S100.eligibilityBody, locale)}</p>

          {mine?.status === 'ACTIVATED' ? (
            <div className="rounded-3xl border border-teal-300/30 bg-teal-500/10 p-6">
              <p className="text-white">{pick(S100.activated, locale)}</p>
              <p className="mt-2 text-sm text-white/60">
                {mine.creditsRemaining} · {mine.expiresAt ? mine.expiresAt.slice(0, 10) : ''}
              </p>
              <Link
                href={localePath('/interview/prep', locale)}
                className="mq-btn mq-btn-primary mt-5 inline-flex min-h-[44px] items-center px-5 text-sm"
              >
                {pick(S100.practiceCta, locale)}
              </Link>
            </div>
          ) : mine?.status === 'PENDING' ? (
            <div className="rounded-3xl border border-amber-300/30 bg-amber-500/10 p-6 text-amber-50">
              {pick(S100.pending, locale)}
            </div>
          ) : mine?.status === 'REJECTED' ? (
            <div className="rounded-3xl border border-white/10 p-6 text-white/70">{pick(S100.rejected, locale)}</div>
          ) : mine?.status === 'EXPIRED' ? (
            <div className="rounded-3xl border border-white/10 p-6 text-white/70">{pick(S100.expired, locale)}</div>
          ) : data.soldOut ? (
            <div className="rounded-3xl border border-white/10 p-6 text-white/70">{pick(S100.soldOut, locale)}</div>
          ) : !ready ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-white/45">…</p>
            </div>
          ) : !signedIn ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="mb-4 text-sm text-white/70">{pick(S100.needAccount, locale)}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={localePath(`/auth/register?callbackUrl=${callback}`, locale)}
                  className="mq-btn mq-btn-primary inline-flex min-h-[44px] items-center px-5 text-sm"
                >
                  {pick(S100.register, locale)}
                </Link>
                <Link
                  href={localePath(`/auth/signin?callbackUrl=${callback}`, locale)}
                  className="mq-btn mq-btn-ghost inline-flex min-h-[44px] items-center px-5 text-sm"
                >
                  {pick(S100.signin, locale)}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => void submit(e)} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <label className="block text-sm text-white/70">
                {pick(S100.name, locale)}
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>
              <label className="block text-sm text-white/70">
                {pick(S100.country, locale)}
                <select
                  required
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                >
                  <option value="">{isAr ? 'اختر' : 'Select'}</option>
                  {MENA_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {isAr ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-white/70">
                {pick(S100.university, locale)}
                <input
                  required
                  value={form.university}
                  onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>
              <label className="block text-sm text-white/70">
                {pick(S100.major, locale)}
                <input
                  required
                  value={form.major}
                  onChange={(e) => setForm((f) => ({ ...f, major: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>
              <fieldset className="text-sm text-white/70">
                <legend className="mb-2">{pick(S100.eligibility, locale)}</legend>
                <label className="mb-2 flex items-center gap-2">
                  <input
                    type="radio"
                    name="eligibility"
                    checked={form.eligibility === 'CURRENT_STUDENT'}
                    onChange={() => setForm((f) => ({ ...f, eligibility: 'CURRENT_STUDENT' }))}
                  />
                  {pick(S100.current, locale)}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="eligibility"
                    checked={form.eligibility === 'GRADUATED_12M'}
                    onChange={() => setForm((f) => ({ ...f, eligibility: 'GRADUATED_12M' }))}
                  />
                  {pick(S100.graduate, locale)}
                </label>
              </fieldset>
              <label className="block text-sm text-white/70">
                {pick(S100.uniEmail, locale)}
                <input
                  type="email"
                  value={form.universityEmail}
                  onChange={(e) => setForm((f) => ({ ...f, universityEmail: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>
              <label className="block text-sm text-white/70">
                {pick(S100.proof, locale)}
                <textarea
                  value={form.proofNote}
                  onChange={(e) => setForm((f) => ({ ...f, proofNote: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
              <button
                type="submit"
                disabled={busy}
                className="mq-btn mq-btn-primary w-full min-h-[44px] text-sm disabled:opacity-60"
              >
                {busy ? '…' : pick(S100.submit, locale)}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="mq-section border-t border-white/10">
        <div className="mq-wrap mx-auto max-w-3xl">
          <h2 className="mq-display mb-4 text-2xl text-white">{pick(S100.termsTitle, locale)}</h2>
          <ul className="space-y-3 text-sm leading-relaxed text-white/65">
            {S100.terms.map((row) => (
              <li key={row.en}>• {pick(row, locale)}</li>
            ))}
          </ul>
        </div>
      </section>
    </AtelierShell>
  );
}
