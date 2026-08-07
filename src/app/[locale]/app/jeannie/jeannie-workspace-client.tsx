'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Bot, Loader2, FileText, Sparkles, Upload } from 'lucide-react';
import { localePath } from '@/i18n/navigation';

type Entitlements = {
  tier: string;
  canUseJeannie: boolean;
  canPractice: boolean;
  cvStudioEnabled: boolean;
  coverLetterAiEnabled: boolean;
  manualTracker?: boolean;
  plan: { label: { en: string; ar: string }; key?: string };
};

type Profile = {
  targetRoles: string[];
  targetCities: string[];
  targetCountries: string[];
  seniority: string | null;
  notes: string | null;
};

export function JeannieWorkspaceClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState('');
  const [cities, setCities] = useState('');
  const [cvText, setCvText] = useState('');
  const [cvOut, setCvOut] = useState('');
  const [coverCompany, setCoverCompany] = useState('');
  const [coverRole, setCoverRole] = useState('');
  const [coverOut, setCoverOut] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [entRes, profileRes] = await Promise.all([
        fetch('/api/jeannie/entitlements'),
        fetch('/api/jeannie/profile'),
      ]);
      if (!entRes.ok) throw new Error('Failed to load entitlements');
      const ent = (await entRes.json()) as Entitlements;
      setEntitlements(ent);

      if (profileRes.ok) {
        const p = (await profileRes.json()) as Profile;
        setProfile(p);
        setRoles((p.targetRoles || []).join(', '));
        setCities((p.targetCities || []).join(', '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveProfile() {
    setBusy('profile');
    setError('');
    try {
      const res = await fetch('/api/jeannie/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRoles: roles
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          targetCities: cities
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      const p = (await res.json()) as Profile;
      setProfile(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy('');
    }
  }

  async function improveCv() {
    setBusy('cv');
    setError('');
    try {
      const res = await fetch('/api/jeannie/cv/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cvText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'CV improve failed');
      setCvOut(data.document?.content || data.content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CV improve failed');
    } finally {
      setBusy('');
    }
  }

  async function generateCover() {
    setBusy('cover');
    setError('');
    try {
      const res = await fetch('/api/jeannie/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: coverCompany,
          roleTitle: coverRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cover letter failed');
      setCoverOut(data.document?.content || data.content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cover letter failed');
    } finally {
      setBusy('');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/60">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mq-kicker mb-2">Jeannie</p>
          <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">
            {isAr ? 'مساحة التحضير' : 'Prep workspace'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">
            {isAr
              ? 'تدرّب، ابنِ جوازك، جهّز خطابك — ثم قدّم بنفسك على موقع الشركة. مقابلة لا تقدّم نيابةً عنك.'
              : 'Practice, build your passport, prep your materials — then apply yourself on the company site. Muqabaleh never applies for you.'}
          </p>
        </div>
        <div className="rounded-2xl border border-teal-300/25 bg-teal-400/10 px-4 py-3 text-sm text-teal-100">
          <div className="flex items-center gap-2 font-bold">
            <Bot size={16} />
            {isAr ? entitlements?.plan.label.ar : entitlements?.plan.label.en}
          </div>
          <p className="mt-1 text-xs text-teal-100/80">
            {isAr ? 'أنت تقدّم دائماً بنفسك' : 'You always apply yourself'}
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href={localePath('/interview/prequal', locale)}
          className="mq-btn mq-btn-primary inline-flex min-h-[48px] items-center justify-center gap-2 text-sm font-bold"
        >
          <Sparkles size={16} />
          {isAr ? 'تدرّب مع جيني' : 'Practice with Jeannie'}
        </Link>
        <Link
          href={localePath('/jobs', locale)}
          className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center text-sm font-bold"
        >
          {isAr ? 'تصفّح الوظائف' : 'Browse jobs'}
        </Link>
        <Link
          href={localePath('/app/passport', locale)}
          className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center text-sm font-bold"
        >
          {isAr ? 'جوازك' : 'Your passport'}
        </Link>
      </div>

      <section className="mq-panel space-y-4 rounded-2xl p-6">
        <h2 className="mq-display text-lg font-bold text-white">
          {isAr ? 'أهدافك' : 'Your targets'}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-white/60">
            {isAr ? 'الأدوار المستهدفة (مفصولة بفاصلة)' : 'Target roles (comma-separated)'}
            <input
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/60">
            {isAr ? 'المدن المستهدفة' : 'Target cities'}
            <input
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy === 'profile'}
          onClick={() => void saveProfile()}
          className="mq-btn mq-btn-ghost inline-flex min-h-[44px] items-center px-4 text-sm font-bold"
        >
          {busy === 'profile' ? <Loader2 className="animate-spin" size={16} /> : null}
          {isAr ? 'حفظ الأهداف' : 'Save targets'}
        </button>
        {profile ? (
          <p className="text-xs text-white/40">
            {isAr ? 'آخر حفظ للأهداف جاهز.' : 'Targets saved.'}
          </p>
        ) : null}
      </section>

      <section className="mq-panel space-y-4 rounded-2xl p-6">
        <h2 className="mq-display flex items-center gap-2 text-lg font-bold text-white">
          <FileText size={18} />
          {isAr ? 'مولّد خطاب التقديم' : 'Cover letter generator'}
        </h2>
        <p className="text-sm text-white/50">
          {isAr
            ? 'جيني تكتب — وأنت ترسل. لا إرسال تلقائي لأصحاب العمل.'
            : 'Jeannie drafts — you send. No automatic emails to employers.'}
        </p>
        {!entitlements?.coverLetterAiEnabled ? (
          <p className="text-sm text-amber-100/80">
            {isAr ? 'يتطلب جيني أو جيني برو.' : 'Requires Jeannie or Jeannie Pro.'}{' '}
            <Link href={localePath('/app/packages', locale)} className="text-teal-300 underline">
              {isAr ? 'الترقية' : 'Upgrade'}
            </Link>
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={coverCompany}
                onChange={(e) => setCoverCompany(e.target.value)}
                placeholder={isAr ? 'الشركة' : 'Company'}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
              <input
                value={coverRole}
                onChange={(e) => setCoverRole(e.target.value)}
                placeholder={isAr ? 'المسمّى' : 'Role'}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </div>
            <button
              type="button"
              disabled={busy === 'cover'}
              onClick={() => void generateCover()}
              className="mq-btn mq-btn-primary inline-flex min-h-[44px] items-center px-4 text-sm font-bold"
            >
              {busy === 'cover' ? <Loader2 className="animate-spin" size={16} /> : null}
              {isAr ? 'توليد الخطاب' : 'Generate letter'}
            </button>
            {coverOut ? (
              <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/75">
                {coverOut}
              </pre>
            ) : null}
          </>
        )}
      </section>

      <section className="mq-panel space-y-4 rounded-2xl p-6">
        <h2 className="mq-display flex items-center gap-2 text-lg font-bold text-white">
          <Upload size={18} />
          {isAr ? 'استوديو السيرة' : 'CV studio'}
        </h2>
        {!entitlements?.cvStudioEnabled ? (
          <p className="text-sm text-amber-100/80">
            {isAr ? 'يتطلب جيني برو.' : 'Requires Jeannie Pro.'}{' '}
            <Link href={localePath('/app/packages', locale)} className="text-teal-300 underline">
              {isAr ? 'الترقية' : 'Upgrade'}
            </Link>
          </p>
        ) : (
          <>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={8}
              placeholder={isAr ? 'الصق سيرتك هنا…' : 'Paste your CV here…'}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
            <button
              type="button"
              disabled={busy === 'cv'}
              onClick={() => void improveCv()}
              className="mq-btn mq-btn-primary inline-flex min-h-[44px] items-center px-4 text-sm font-bold"
            >
              {busy === 'cv' ? <Loader2 className="animate-spin" size={16} /> : null}
              {isAr ? 'تحسين السيرة' : 'Improve CV'}
            </button>
            {cvOut ? (
              <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/75">
                {cvOut}
              </pre>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
