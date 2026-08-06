'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Bot,
  Loader2,
  RefreshCw,
  Check,
  X,
  Send,
  FileText,
  Sparkles,
  Upload,
  Activity,
} from 'lucide-react';
import { localePath } from '@/i18n/navigation';

type Entitlements = {
  tier: string;
  appliesLeft: number;
  canUseJeannie: boolean;
  canApply: boolean;
  cvStudioEnabled: boolean;
  coverLetterAiEnabled: boolean;
  cvUpload?: boolean;
  coverLetterUpload?: boolean;
  tracker?: 'none' | 'standard' | 'full';
  plan: { label: { en: string; ar: string }; monthlyApplies: number };
  sla?: {
    promised: number;
    delivered: number;
    remaining: number;
    periodEnd: string | null;
    status: string | null;
    rolledIn: number;
  };
};

type Profile = {
  targetRoles: string[];
  targetCities: string[];
  targetCountries: string[];
  seniority: string | null;
  notes: string | null;
};

type Opportunity = {
  id: string;
  status: string;
  companyName: string;
  title: string;
  titleAr?: string | null;
  city?: string | null;
  country?: string | null;
  matchScore: number;
  matchReason?: string | null;
  matchReasonAr?: string | null;
  coverLetter?: string | null;
  failureReason?: string | null;
  passportVerificationId?: string | null;
};

type TrackerPayload = {
  tracker: 'none' | 'standard' | 'full';
  items: Array<{
    id: string;
    kind: string;
    status: string;
    companyName: string;
    title: string;
    matchScore?: number | null;
    source?: string | null;
    passportVerificationId?: string | null;
    updatedAt: string;
  }>;
  insights: {
    awaitingApproval: number;
    approved: number;
    packetReady: number;
    applied: number;
    avgMatchScore: number | null;
    conversionApproveToApply: number | null;
  } | null;
};

export function JeannieWorkspaceClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [roles, setRoles] = useState('');
  const [cities, setCities] = useState('');
  const [cvText, setCvText] = useState('');
  const [cvOut, setCvOut] = useState('');
  const [letterOut, setLetterOut] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterDraft, setCoverLetterDraft] = useState('');
  const [applyForId, setApplyForId] = useState<string | null>(null);
  const [tracker, setTracker] = useState<TrackerPayload | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [entRes, profRes, oppRes, trackRes] = await Promise.all([
        fetch('/api/jeannie/entitlements'),
        fetch('/api/jeannie/profile'),
        fetch('/api/jeannie/opportunities'),
        fetch('/api/jeannie/tracker'),
      ]);
      if (!entRes.ok) throw new Error('Failed to load entitlements');
      const ent = (await entRes.json()) as Entitlements;
      setEntitlements(ent);
      if (profRes.ok) {
        const data = (await profRes.json()) as { profile: Profile };
        setProfile(data.profile);
        setRoles((data.profile.targetRoles || []).join(', '));
        setCities((data.profile.targetCities || []).join(', '));
      }
      if (oppRes.ok) {
        const data = (await oppRes.json()) as { opportunities: Opportunity[] };
        setOpps(data.opportunities || []);
      }
      if (trackRes.ok) {
        setTracker((await trackRes.json()) as TrackerPayload);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveTargets() {
    setBusy('targets');
    setError('');
    try {
      const res = await fetch('/api/jeannie/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRoles: roles.split(',').map((s) => s.trim()).filter(Boolean),
          targetCities: cities.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setProfile(data.profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy('');
    }
  }

  async function refreshShortlist() {
    setBusy('shortlist');
    setError('');
    try {
      const res = await fetch('/api/jeannie/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 8 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Shortlist failed');
      setOpps(data.opportunities || []);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Shortlist failed');
    } finally {
      setBusy('');
    }
  }

  async function act(id: string, action: 'approve' | 'reject') {
    setBusy(`${action}:${id}`);
    setError('');
    try {
      const res = await fetch(`/api/jeannie/opportunities/${id}/${action}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy('');
    }
  }

  async function submitApply(id: string) {
    setBusy(`apply:${id}`);
    setError('');
    try {
      const form = new FormData();
      if (coverLetterDraft.trim()) form.set('coverLetter', coverLetterDraft.trim());
      if (cvFile) form.set('cv', cvFile);
      const res = await fetch(`/api/jeannie/opportunities/${id}/apply`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Apply failed');
      setApplyForId(null);
      setCoverLetterDraft('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Apply failed');
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
        body: JSON.stringify({
          sourceText: cvText,
          targetRole: roles.split(',')[0]?.trim() || 'Target role',
          language: isAr ? 'both' : 'en',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'CV studio failed');
      setCvOut(data.document?.content || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'CV studio failed');
    } finally {
      setBusy('');
    }
  }

  async function genLetter(opp: Opportunity) {
    setBusy(`letter:${opp.id}`);
    setError('');
    try {
      const res = await fetch('/api/jeannie/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: opp.companyName,
          roleTitle: opp.title,
          opportunityId: opp.id,
          language: isAr ? 'both' : 'en',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cover letter failed');
      const content = data.document?.content || '';
      setLetterOut(content);
      setCoverLetterDraft(content);
      setApplyForId(opp.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cover letter failed');
    } finally {
      setBusy('');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/50">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  const locked = !entitlements?.canUseJeannie;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mq-kicker mb-2">Jeannie</p>
          <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">
            {isAr ? 'مساحة جيني' : 'Jeannie workspace'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">
            {isAr
              ? 'جيني ترشّح وظائف خارجية → توافق → تسلّم حزمة تقديم (بريد المسؤول أو رابط متتبّع) مع السيرة والخطاب والجواز. ليس عشوائياً ولا ملء آلي لأنظمة التتبع.'
              : 'Jeannie shortlists external roles → you approve → she delivers your packet (recruiter email or tracked apply link) with CV, cover letter, and passport. NOT SPAM — no ATS bot-filling.'}
          </p>
        </div>
        <div className="rounded-2xl border border-teal-300/25 bg-teal-400/10 px-4 py-3 text-sm text-teal-100">
          <div className="flex items-center gap-2 font-bold">
            <Bot size={16} />
            {isAr ? entitlements?.plan.label.ar : entitlements?.plan.label.en}
          </div>
          <p className="mt-1 text-xs text-teal-100/80">
            {isAr
              ? `وعد الفترة: ${entitlements?.sla?.delivered ?? 0}/${entitlements?.sla?.promised ?? entitlements?.plan.monthlyApplies ?? 0} مُسلَّم · متبقي تشغيل ${entitlements?.appliesLeft ?? 0}`
              : `Period promise: ${entitlements?.sla?.delivered ?? 0}/${entitlements?.sla?.promised ?? entitlements?.plan.monthlyApplies ?? 0} delivered · ${entitlements?.appliesLeft ?? 0} ops left`}
          </p>
          {(entitlements?.sla?.rolledIn ?? 0) > 0 ? (
            <p className="mt-1 text-[11px] text-amber-100/90">
              {isAr
                ? `يشمل ${entitlements?.sla?.rolledIn} ترحيلات من فترة سابقة — نفي بوعدنا.`
                : `Includes ${entitlements?.sla?.rolledIn} rolled from prior period — we keep the promise.`}
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      {locked ? (
        <div className="mq-panel space-y-4 rounded-2xl p-6 text-center">
          <p className="text-white/70">
            {isAr
              ? 'المجاني يبني جوازك عبر التدريب. فعّل جيني لفتح الترشيحات والتقديم بموافقتك.'
              : 'Free builds your passport through practice. Unlock Jeannie for approve-gated shortlists and applies.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={localePath('/interview/prequal', locale)}
              className="mq-btn mq-btn-ghost inline-flex px-5 py-2.5 text-sm"
            >
              {isAr ? 'تدريب الجواز' : 'Practice for passport'}
            </Link>
            <Link
              href={localePath('/app/packages', locale)}
              className="mq-btn mq-btn-primary inline-flex px-5 py-2.5 text-sm"
            >
              {isAr ? 'عرض الباقات' : 'See packages'}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="mq-panel rounded-2xl p-5 md:p-6">
            <h2 className="mq-display text-lg font-bold text-white">
              {isAr ? 'أهدافك' : 'Your targets'}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block text-sm text-white/60">
                {isAr ? 'الأدوار (مفصولة بفاصلة)' : 'Roles (comma-separated)'}
                <input
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-teal-300/40"
                />
              </label>
              <label className="block text-sm text-white/60">
                {isAr ? 'المدن (مفصولة بفاصلة)' : 'Cities (comma-separated)'}
                <input
                  value={cities}
                  onChange={(e) => setCities(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-teal-300/40"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void saveTargets()}
                disabled={busy === 'targets'}
                className="mq-btn mq-btn-ghost inline-flex items-center gap-2 text-sm"
              >
                {busy === 'targets' ? <Loader2 size={14} className="animate-spin" /> : null}
                {isAr ? 'حفظ الأهداف' : 'Save targets'}
              </button>
              <button
                type="button"
                onClick={() => void refreshShortlist()}
                disabled={busy === 'shortlist'}
                className="mq-btn mq-btn-primary inline-flex items-center gap-2 text-sm"
              >
                {busy === 'shortlist' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                {isAr ? 'حدّث ترشيحات جيني' : 'Refresh Jeannie shortlist'}
              </button>
            </div>
          </section>

          <section className="mq-panel rounded-2xl p-5 md:p-6">
            <h2 className="mq-display mb-3 flex items-center gap-2 text-lg font-bold text-white">
              <Upload size={18} className="text-teal-200" />
              {isAr ? 'حزمة التقديم' : 'Apply packet'}
            </h2>
            <p className="mb-4 text-sm text-white/50">
              {isAr
                ? 'ارفع سيرتك واكتب خطابك قبل أن تقدّم جيني. التقديم الخارجي يجهّز الحزمة دون خصم الحصة حتى يتصل لوح حي.'
                : 'Upload your CV and write a cover letter before Jeannie applies. External shortlists prepare a packet without charging quota until a live board is connected.'}
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-sm text-white/60">
                {isAr ? 'ملف السيرة (PDF/DOC)' : 'CV file (PDF/DOC)'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="mt-1.5 block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-400/20 file:px-3 file:py-2 file:text-teal-100"
                />
                {cvFile ? (
                  <span className="mt-1 block text-xs text-teal-200/80">{cvFile.name}</span>
                ) : null}
              </label>
              <label className="block text-sm text-white/60">
                {isAr ? 'خطاب التغطية' : 'Cover letter'}
                <textarea
                  value={coverLetterDraft}
                  onChange={(e) => setCoverLetterDraft(e.target.value)}
                  rows={4}
                  placeholder={
                    isAr ? 'اكتب خطابك أو ولّده من جيني برو…' : 'Write yours or generate with Jeannie Pro…'
                  }
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-teal-300/40"
                />
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="mq-display text-lg font-bold text-white">
              {isAr ? 'الترشيحات (بانتظار موافقتك)' : 'Shortlist (awaiting your approval)'}
            </h2>
            {!opps.length ? (
              <div className="mq-panel rounded-2xl p-6 text-sm text-white/55">
                {isAr
                  ? 'لا ترشيحات بعد. احفظ أهدافك ثم حدّث القائمة.'
                  : 'No opportunities yet. Save targets, then refresh the shortlist.'}
              </div>
            ) : (
              opps.map((opp) => {
                const title = isAr && opp.titleAr ? opp.titleAr : opp.title;
                const reason = isAr && opp.matchReasonAr ? opp.matchReasonAr : opp.matchReason;
                const showApplyPanel = applyForId === opp.id;
                return (
                  <article key={opp.id} className="mq-panel rounded-2xl p-4 md:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm text-white/55">
                          {opp.companyName}
                          {opp.city || opp.country
                            ? ` · ${[opp.city, opp.country].filter(Boolean).join(', ')}`
                            : ''}
                        </p>
                        <p className="mt-2 text-xs text-teal-200/90">
                          {isAr ? 'تطابق' : 'Fit'} {opp.matchScore}% · {opp.status}
                        </p>
                        {reason ? (
                          <p className="mt-2 text-sm text-white/50">{reason}</p>
                        ) : null}
                        {opp.failureReason ? (
                          <p className="mt-2 text-sm text-red-200">{opp.failureReason}</p>
                        ) : null}
                        {opp.passportVerificationId ? (
                          <p className="mt-2 text-xs text-white/40">
                            Passport · {opp.passportVerificationId}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['SUGGESTED', 'AWAITING_APPROVAL'].includes(opp.status) ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void act(opp.id, 'approve')}
                              className="mq-btn mq-btn-primary inline-flex items-center gap-1.5 !min-h-[40px] px-3 text-xs"
                            >
                              <Check size={14} />
                              {isAr ? 'موافقة وتقديم' : 'Approve & apply'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void act(opp.id, 'reject')}
                              className="mq-btn mq-btn-ghost inline-flex items-center gap-1.5 !min-h-[40px] px-3 text-xs"
                            >
                              <X size={14} />
                              {isAr ? 'رفض' : 'Skip'}
                            </button>
                          </>
                        ) : null}
                        {opp.status === 'APPROVED' || opp.status === 'FAILED' ? (
                          <button
                            type="button"
                            onClick={() =>
                              setApplyForId((cur) => (cur === opp.id ? null : opp.id))
                            }
                            disabled={!entitlements?.canApply && opp.status === 'APPROVED'}
                            className="mq-btn mq-btn-primary inline-flex items-center gap-1.5 !min-h-[40px] px-3 text-xs"
                          >
                            <Send size={14} />
                            {isAr ? 'جهّز / قدّم' : 'Prepare / apply'}
                          </button>
                        ) : null}
                        {entitlements?.coverLetterAiEnabled ? (
                          <button
                            type="button"
                            onClick={() => void genLetter(opp)}
                            className="mq-btn mq-btn-ghost inline-flex items-center gap-1.5 !min-h-[40px] px-3 text-xs"
                          >
                            <FileText size={14} />
                            {isAr ? 'خطاب' : 'Cover letter'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {showApplyPanel ? (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="mb-3 text-xs text-white/45">
                          {isAr
                            ? 'أكد الحزمة ثم اطلب من جيني التقديم أو تجهيز الحزمة.'
                            : 'Confirm the packet, then ask Jeannie to apply or prepare it.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => void submitApply(opp.id)}
                          disabled={busy === `apply:${opp.id}`}
                          className="mq-btn mq-btn-primary inline-flex items-center gap-2 text-sm"
                        >
                          {busy === `apply:${opp.id}` ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Send size={14} />
                          )}
                          {isAr ? 'جيني تقدّم الآن' : 'Jeannie apply now'}
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </section>

          {tracker && tracker.tracker !== 'none' ? (
            <section className="mq-panel rounded-2xl p-5 md:p-6">
              <h2 className="mq-display mb-3 flex items-center gap-2 text-lg font-bold text-white">
                <Activity size={18} className="text-teal-200" />
                {isAr ? 'متتبع جيني' : 'Jeannie tracker'}
                {tracker.tracker === 'full' ? (
                  <span className="text-xs font-normal text-amber-200/80">Pro</span>
                ) : null}
              </h2>
              {tracker.insights ? (
                <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-white/60 md:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    {isAr ? 'بانتظار الموافقة' : 'Awaiting'} · {tracker.insights.awaitingApproval}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    {isAr ? 'حزم جاهزة' : 'Packets'} · {tracker.insights.packetReady}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    {isAr ? 'مقدَّم' : 'Applied'} · {tracker.insights.applied}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    {isAr ? 'متوسط التطابق' : 'Avg fit'} · {tracker.insights.avgMatchScore ?? '—'}
                  </div>
                </div>
              ) : null}
              <ul className="space-y-2">
                {(tracker.items || []).slice(0, 12).map((item) => (
                  <li
                    key={`${item.kind}-${item.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm"
                  >
                    <span className="text-white/85">
                      {item.title} · {item.companyName}
                    </span>
                    <span className="text-xs text-white/45">
                      {item.status}
                      {item.source ? ` · ${item.source}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {entitlements?.cvStudioEnabled ? (
            <section className="mq-panel rounded-2xl p-5 md:p-6">
              <h2 className="mq-display mb-3 flex items-center gap-2 text-lg font-bold text-white">
                <Sparkles size={18} className="text-amber-200" />
                {isAr ? 'استوديو السيرة (جيني برو)' : 'CV studio (Jeannie Pro)'}
              </h2>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={7}
                placeholder={isAr ? 'الصق مسودة سيرتك هنا…' : 'Paste your CV draft here…'}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-amber-200/40"
              />
              <button
                type="button"
                onClick={() => void improveCv()}
                disabled={busy === 'cv'}
                className="mq-btn mq-btn-ghost mt-3 inline-flex items-center gap-2 text-sm"
              >
                {busy === 'cv' ? <Loader2 size={14} className="animate-spin" /> : null}
                {isAr ? 'حسّن السيرة' : 'Improve CV'}
              </button>
              {cvOut ? (
                <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/75">
                  {cvOut}
                </pre>
              ) : null}
            </section>
          ) : null}

          {letterOut ? (
            <section className="mq-panel rounded-2xl p-5">
              <h3 className="mb-2 text-sm font-bold text-white">
                {isAr ? 'آخر خطاب مولَّد' : 'Latest generated cover letter'}
              </h3>
              <pre className="whitespace-pre-wrap text-sm text-white/70">{letterOut}</pre>
            </section>
          ) : null}
        </>
      )}

      {profile ? (
        <p className="text-xs text-white/35">
          {isAr ? 'الأهداف المحفوظة:' : 'Saved targets:'}{' '}
          {(profile.targetRoles || []).join(', ') || '—'}
        </p>
      ) : null}
    </div>
  );
}
