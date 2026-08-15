'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mic } from 'lucide-react';
import { AtelierFlowShell } from '@/components/landing/crystal/AtelierFlowShell';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { FreeInterviewPaywall } from '@/components/paywall/FreeInterviewPaywall';
import { localePath } from '@/i18n/navigation';
import type { CoachGender, LabeledOption, PrepSelections } from '@/lib/coach/types';
import { inferCoachRoleIdFromTitle } from '@/lib/jobs/jeannie-practice';
import { trackInterviewStarted } from '@/lib/analytics-ga';

type RolePublic = LabeledOption & {
  category: string;
  industries: string[];
};

type PublicConfig = {
  roleCategories?: LabeledOption[];
  roles: RolePublic[];
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

type Props = {
  initialCompany?: string;
  initialRoleTitle?: string;
  initialJobId?: string;
  /** Server-side hard gate when free quota is exhausted. */
  forcePaywall?: boolean;
};

export function PrepClient({
  initialCompany,
  initialRoleTitle,
  initialJobId,
  forcePaywall = false,
}: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const [cfg, setCfg] = useState<PublicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessBlocked, setAccessBlocked] = useState<string | null>(() => {
    if (!forcePaywall) return null;
    return locale === 'ar'
      ? 'لقد استخدمت مقابلتك المجانية. اختر خطتك للمتابعة.'
      : "You've used your free interview. Choose a plan to continue.";
  });
  const [remaining, setRemaining] = useState<number | null>(null);
  const [canResume, setCanResume] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [roleQuery, setRoleQuery] = useState('');
  const [form, setForm] = useState<PrepSelections>({
    role: '',
    industry: '',
    seniority: '',
    language: isAr ? 'ar' : 'en',
    coachGender: 'female',
    companyName: initialCompany || '',
    roleTitle: initialRoleTitle || undefined,
    jobId: initialJobId || undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const fromJob = Boolean(initialCompany || initialRoleTitle);

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
          canResume?: boolean;
          activeSessionId?: string | null;
        };
        if (cancelled) return;
        setCfg(c);
        setCanResume(!!a.canResume && !!a.activeSessionId);
        setActiveSessionId(a.activeSessionId || null);
        if (a.canStart === false && !a.canResume) {
          setAccessBlocked(
            a.reason ||
              (isAr
                ? 'لقد استخدمت مقابلتك المجانية. اختر خطتك للمتابعة.'
                : "You've used your free interview. Choose a plan to continue."),
          );
        }
        setRemaining(typeof a.remaining === 'number' ? a.remaining : null);

        const inferredId = initialRoleTitle
          ? inferCoachRoleIdFromTitle(initialRoleTitle)
          : '';
        const matched =
          (inferredId && (c.roles || []).find((r) => r.id === inferredId)) ||
          (initialRoleTitle
            ? (c.roles || []).find(
                (r) =>
                  r.en.toLowerCase().includes(initialRoleTitle.toLowerCase()) ||
                  initialRoleTitle.toLowerCase().includes(r.en.toLowerCase()),
              )
            : null);

        const firstCat =
          matched?.category ||
          c.roleCategories?.[0]?.id ||
          c.roles[0]?.category ||
          '';
        const rolesInCat = (c.roles || []).filter((r) => r.category === firstCat);
        const firstRole = matched || rolesInCat[0] || c.roles[0];
        setCategory(firstCat);
        if (initialRoleTitle) setRoleQuery(initialRoleTitle);
        setForm((prev) => ({
          ...prev,
          role: firstRole?.id || '',
          industry: firstRole?.industries?.[0] || c.industries[0]?.id || '',
          seniority: c.seniority.find((s) => s.id === 'mid')?.id || c.seniority[0]?.id || '',
          companyName: initialCompany || prev.companyName,
          roleTitle: initialRoleTitle || prev.roleTitle,
          jobId: initialJobId || prev.jobId,
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
  }, [isAr, initialCompany, initialRoleTitle, initialJobId]);

  const label = useMemo(
    () => (opt: LabeledOption) => (isAr ? opt.ar : opt.en),
    [isAr],
  );

  const categories = cfg?.roleCategories?.length
    ? cfg.roleCategories
    : Array.from(new Set((cfg?.roles || []).map((r) => r.category))).map((id) => ({
        id,
        en: id,
        ar: id,
      }));

  const rolesInCategory = useMemo(() => {
    const list = (cfg?.roles || []).filter((r) => !category || r.category === category);
    const q = roleQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.en.toLowerCase().includes(q) ||
        r.ar.includes(roleQuery.trim()) ||
        r.id.includes(q),
    );
  }, [cfg?.roles, category, roleQuery]);

  const industriesForRole = useMemo(() => {
    const role = (cfg?.roles || []).find((r) => r.id === form.role);
    if (!role?.industries?.length) return cfg?.industries || [];
    const allowed = new Set(role.industries);
    const filtered = (cfg?.industries || []).filter((i) => allowed.has(i.id));
    return filtered.length ? filtered : cfg?.industries || [];
  }, [cfg?.roles, cfg?.industries, form.role]);

  const onCategoryChange = (next: string) => {
    setCategory(next);
    setRoleQuery('');
    const first = (cfg?.roles || []).find((r) => r.category === next);
    if (first) {
      setForm((f) => ({
        ...f,
        role: first.id,
        industry: first.industries[0] || f.industry,
      }));
    }
  };

  const onRoleChange = (roleId: string) => {
    const role = (cfg?.roles || []).find((r) => r.id === roleId);
    setForm((f) => ({
      ...f,
      role: roleId,
      industry: role?.industries?.[0] || f.industry,
    }));
  };

  const goToSession = (payload: PrepSelections, mode: 'new' | 'resume') => {
    const key = cfg?.storageKey || STORAGE_FALLBACK;
    try {
      sessionStorage.setItem(key, JSON.stringify(payload));
      if (mode === 'resume' && activeSessionId) {
        sessionStorage.setItem('mq_coach_session', activeSessionId);
        sessionStorage.setItem('mq_coach_resume', '1');
      } else {
        sessionStorage.removeItem('mq_coach_session');
        sessionStorage.setItem('mq_coach_resume', '0');
      }
    } catch {
      /* ignore */
    }
    if (mode === 'new') {
      trackInterviewStarted({
        language: payload.language,
        role: payload.roleTitle || payload.role,
        locale,
      });
    }
    router.push(localePath('/interview/session', locale));
  };

  const onResume = async () => {
    setError(null);
    if (!canResume || !activeSessionId) return;
    try {
      const res = await fetch(
        `/api/interview/coach/session?sessionId=${encodeURIComponent(activeSessionId)}`,
      );
      const data = (await res.json()) as {
        prep?: PrepSelections;
        error?: string;
      };
      if (!data.prep) {
        setError(data.error || (isAr ? 'تعذّر استئناف الجلسة.' : 'Could not resume session.'));
        return;
      }
      goToSession(data.prep, 'resume');
    } catch {
      setError(isAr ? 'تعذّر استئناف الجلسة.' : 'Could not resume session.');
    }
  };

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
    const payload: PrepSelections = {
      ...form,
      companyName: form.companyName?.trim() || undefined,
      roleTitle: form.roleTitle?.trim() || initialRoleTitle?.trim() || undefined,
      jobId: form.jobId || initialJobId || undefined,
      coachGender: form.coachGender === 'none' ? 'none' : form.coachGender,
    };
    goToSession(payload, 'new');
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
          {isAr ? 'إعداد المقابلة الصوتية مع جيني' : 'Prep your voice interview with Jeannie'}
        </h1>
        <p className="mt-2 max-w-2xl text-white/60">
          {isAr
            ? 'جلسة صوتية مباشرة بالميكروفون. اختر الفئة ثم الدور والسياق — تُحفظ جلستك ويمكنك المتابعة لاحقاً.'
            : 'Live voice practice with your microphone. Choose a category, then role and context — your session is saved so you can resume.'}
        </p>

        {fromJob ? (
          <div className="mt-5 rounded-2xl border border-teal-300/30 bg-teal-400/10 px-4 py-3 text-sm text-teal-50">
            <p className="inline-flex items-center gap-2 font-semibold">
              <Mic size={16} />
              {isAr ? 'تدريب صوتي لهذه الوظيفة' : 'Voice practice for this role'}
            </p>
            <p className="mt-1 text-teal-50/85">
              {[initialRoleTitle, initialCompany].filter(Boolean).join(' · ')}
            </p>
          </div>
        ) : null}

        {canResume ? (
          <div className="mt-6 rounded-2xl border border-teal-300/30 bg-teal-400/10 p-5">
            <p className="text-teal-50">
              {isAr
                ? 'لديك مقابلة جارية. يمكنك المتابعة من حيث توقفت.'
                : 'You have an interview in progress. Continue where you left off.'}
            </p>
            <button
              type="button"
              onClick={onResume}
              className="mq-btn mq-btn-primary mt-4 inline-flex"
            >
              {isAr ? 'متابعة المقابلة' : 'Continue interview'}
            </button>
          </div>
        ) : null}

        <FreeInterviewPaywall open={!!accessBlocked} reason={accessBlocked} />

        <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-6">
          <Field label={isAr ? 'الفئة' : 'Category'} required>
            <select
              className="min-h-12 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-white"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {label(c)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={isAr ? 'الدور' : 'Role'} required>
            <input
              className="mb-2 min-h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-white placeholder:text-white/35"
              value={roleQuery}
              onChange={(e) => setRoleQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن دور…' : 'Search roles…'}
            />
            <select
              className="min-h-12 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-white"
              value={form.role}
              onChange={(e) => onRoleChange(e.target.value)}
              required
            >
              {rolesInCategory.map((r) => (
                <option key={r.id} value={r.id}>
                  {label(r)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-white/40">
              {isAr
                ? `${rolesInCategory.length} أدوار في هذه الفئة`
                : `${rolesInCategory.length} roles in this category`}
            </p>
          </Field>

          <Field label={isAr ? 'القطاع' : 'Industry'} required>
            <select
              className="min-h-12 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-white"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              required
            >
              {industriesForRole.map((r) => (
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
