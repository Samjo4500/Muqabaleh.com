'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { AtelierFlowShell } from '@/components/landing/crystal/AtelierFlowShell';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';
import type { CoachGender, LabeledOption, PrepSelections } from '@/lib/coach/types';

type PublicConfig = {
  roles: LabeledOption[];
  industries: LabeledOption[];
  seniority: LabeledOption[];
  languages: LabeledOption[];
  storageKey: string;
  coaches: {
    female: { name: string; nameAr: string; image: string };
    male: { name: string; nameAr: string; image: string };
  };
};

const STORAGE_FALLBACK = 'mq_coach_prep';

export function PrepClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const [cfg, setCfg] = useState<PublicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessBlocked, setAccessBlocked] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [form, setForm] = useState<PrepSelections>({
    role: '',
    industry: '',
    seniority: '',
    language: isAr ? 'ar' : 'en',
    coachGender: 'female',
    companyName: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          fetch('/api/interview/coach/config'),
          fetch('/api/interview/coach/access'),
        ]);
        const c = (await cRes.json()) as PublicConfig;
        const a = (await aRes.json()) as {
          canStart?: boolean;
          remaining?: number | null;
          reason?: string;
        };
        if (cancelled) return;
        setCfg(c);
        if (a.canStart === false) {
          setAccessBlocked(
            a.reason ||
              (isAr
                ? 'لقد استهلكت مقابلتك المجانية. رقِّ حسابك للمتابعة.'
                : 'You have used your free interview. Upgrade to continue.'),
          );
        }
        setRemaining(typeof a.remaining === 'number' ? a.remaining : null);
        setForm((prev) => ({
          ...prev,
          role: c.roles[0]?.id || '',
          industry: c.industries[0]?.id || '',
          seniority: c.seniority.find((s) => s.id === 'mid')?.id || c.seniority[0]?.id || '',
        }));
      } catch {
        if (!cancelled) setError(isAr ? 'تعذّر تحميل الإعدادات.' : 'Could not load setup.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAr]);

  const label = useMemo(
    () => (opt: LabeledOption) => (isAr ? opt.ar : opt.en),
    [isAr],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (accessBlocked) {
      setError(accessBlocked);
      return;
    }
    if (!form.role || !form.industry || !form.seniority || !form.language || !form.coachGender) {
      setError(isAr ? 'أكمل جميع الحقول المطلوبة.' : 'Complete all required fields.');
      return;
    }
    const key = cfg?.storageKey || STORAGE_FALLBACK;
    const payload: PrepSelections = {
      ...form,
      companyName: form.companyName?.trim() || undefined,
      coachGender: form.coachGender === 'none' ? 'none' : form.coachGender,
    };
    try {
      sessionStorage.setItem(key, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    router.push(localePath('/interview/session', locale));
  };

  if (loading) {
    return (
      <AtelierFlowShell>
        <div className="flex min-h-[50vh] items-center justify-center text-white/70">
          <Loader2 className="animate-spin" />
        </div>
      </AtelierFlowShell>
    );
  }

  return (
    <AtelierFlowShell>
      <div className="mq-wrap py-10 md:py-14" dir={isAr ? 'rtl' : 'ltr'} lang={isAr ? 'ar' : 'en'}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href={localePath('/', locale)} aria-label="Muqabaleh">
            <BrandLogo size="nav" />
          </Link>
          {remaining != null ? (
            <p className="text-sm text-teal-200/80">
              {isAr ? `المقابلات المتبقية: ${remaining}` : `Interviews left: ${remaining}`}
            </p>
          ) : (
            <p className="text-sm text-teal-200/80">
              {isAr ? 'مقابلات بلا حدود' : 'Unlimited interviews'}
            </p>
          )}
        </div>

        <h1 className="mq-display text-3xl font-bold text-white md:text-4xl">
          {isAr ? 'إعداد المقابلة مع جيني' : 'Prep your interview with Jeannie'}
        </h1>
        <p className="mt-2 max-w-2xl text-white/60">
          {isAr
            ? 'اختر الدور والسياق. لن نكتب في قاعدة البيانات حتى تنتهي المقابلة.'
            : 'Choose role and context. Nothing is written to the database until the interview ends.'}
        </p>

        {accessBlocked ? (
          <div className="mt-8 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-6">
            <p className="text-amber-100">{accessBlocked}</p>
            <Link
              href={localePath('/#pricing', locale)}
              className="mq-btn mq-btn-primary mt-4 inline-flex"
            >
              {isAr ? 'عرض الباقات' : 'View plans'}
            </Link>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-6">
          <Field label={isAr ? 'الدور' : 'Role'} required>
            <select
              className="min-h-12 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-white"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              required
            >
              {(cfg?.roles || []).map((r) => (
                <option key={r.id} value={r.id}>
                  {label(r)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={isAr ? 'القطاع' : 'Industry'} required>
            <select
              className="min-h-12 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-white"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              required
            >
              {(cfg?.industries || []).map((r) => (
                <option key={r.id} value={r.id}>
                  {label(r)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={isAr ? 'المستوى' : 'Seniority'} required>
            <div className="flex flex-wrap gap-3">
              {(cfg?.seniority || []).map((s) => (
                <RadioChip
                  key={s.id}
                  checked={form.seniority === s.id}
                  onChange={() => setForm((f) => ({ ...f, seniority: s.id }))}
                  label={label(s)}
                />
              ))}
            </div>
          </Field>

          <Field label={isAr ? 'لغة المقابلة' : 'Interview language'} required>
            <div className="flex flex-wrap gap-3">
              {(cfg?.languages || []).map((s) => (
                <RadioChip
                  key={s.id}
                  checked={form.language === s.id}
                  onChange={() =>
                    setForm((f) => ({
                      ...f,
                      language: s.id as PrepSelections['language'],
                    }))
                  }
                  label={label(s)}
                />
              ))}
            </div>
          </Field>

          <Field label={isAr ? 'جنس المدرب' : 'Coach gender'} required>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { id: 'female' as CoachGender, en: 'Female (Jeannie)', ar: 'أنثى (جيني)' },
                  { id: 'male' as CoachGender, en: 'Male (Jean)', ar: 'ذكر (جين)' },
                  { id: 'none' as CoachGender, en: 'No preference', ar: 'بدون تفضيل' },
                ] as const
              ).map((s) => (
                <RadioChip
                  key={s.id}
                  checked={form.coachGender === s.id}
                  onChange={() => setForm((f) => ({ ...f, coachGender: s.id }))}
                  label={isAr ? s.ar : s.en}
                />
              ))}
            </div>
          </Field>

          <Field label={isAr ? 'اسم الشركة (اختياري)' : 'Company name (optional)'}>
            <input
              className="min-h-12 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-white placeholder:text-white/35"
              value={form.companyName || ''}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              placeholder={isAr ? 'مثال: شركة في الرياض' : 'e.g. a company in Riyadh'}
            />
          </Field>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={!!accessBlocked}
            className="mq-btn mq-btn-primary mq-btn-shimmer min-h-[52px] w-full text-sm font-bold disabled:opacity-50"
          >
            {isAr ? 'ابدأ المقابلة' : 'Start interview'}
          </button>
        </form>
      </div>
    </AtelierFlowShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-white/70">
        {label}
        {required ? <span className="text-teal-300"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function RadioChip({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`rounded-xl border px-3 py-2 text-sm transition ${
        checked
          ? 'border-teal-300/50 bg-teal-400/15 text-teal-100'
          : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25'
      }`}
    >
      {label}
    </button>
  );
}
