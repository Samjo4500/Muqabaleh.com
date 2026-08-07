'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { localePath } from '@/i18n/navigation';

type AppStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED';

type ManualApp = {
  id: string;
  companyName: string;
  role: string;
  status: AppStatus;
  notes: string | null;
  appliedDate: string;
  updatedAt: string;
};

const COLUMNS: { key: AppStatus; en: string; ar: string }[] = [
  { key: 'APPLIED', en: 'Applied', ar: 'تم التقديم' },
  { key: 'SCREENING', en: 'Screening', ar: 'فرز' },
  { key: 'INTERVIEW', en: 'Interview', ar: 'مقابلة' },
  { key: 'OFFER', en: 'Offer', ar: 'عرض' },
  { key: 'HIRED', en: 'Hired', ar: 'توظيف' },
  { key: 'REJECTED', en: 'Rejected', ar: 'رفض' },
];

export function TrackerClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [items, setItems] = useState<ManualApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setUpgrade(false);
    try {
      const res = await fetch('/api/manual-applications');
      const data = await res.json().catch(() => ({}));
      if (res.status === 403 && data.code === 'UPGRADE_REQUIRED') {
        setUpgrade(true);
        setItems([]);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data.applications || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.key, [] as ManualApp[]])) as Record<
      AppStatus,
      ManualApp[]
    >;
    for (const item of items) {
      (map[item.status] || map.APPLIED).push(item);
    }
    return map;
  }, [items]);

  const create = async () => {
    if (!companyName.trim() || !role.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/manual-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: companyName.trim(), role: role.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCompanyName('');
      setRole('');
      setItems((prev) => [data.application, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const move = async (id: string, status: AppStatus) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const res = await fetch(`/api/manual-applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) void load();
  };

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((a) => a.id !== id));
    const res = await fetch(`/api/manual-applications/${id}`, { method: 'DELETE' });
    if (!res.ok) void load();
  };

  if (loading) {
    return (
      <div className="mt-10 flex items-center justify-center gap-2 text-white/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        {isAr ? 'جاري التحميل…' : 'Loading…'}
      </div>
    );
  }

  if (upgrade) {
    return (
      <div className="mq-panel mt-8 rounded-2xl p-8 text-center">
        <p className="text-white/70">
          {isAr
            ? 'متتبّع التقديم اليدوي متاح مع باقة جيني فما فوق.'
            : 'The manual application tracker is available on Jeannie plans and above.'}
        </p>
        <Link
          href={localePath('/app/packages', locale)}
          className="mq-btn mq-btn-primary mt-6 inline-flex px-5 py-2.5 text-sm"
        >
          {isAr ? 'عرض الباقات' : 'View packages'}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <p className="text-xs text-white/45">
          {isAr
            ? 'أنت تقدّم بنفسك على موقع الشركة — هذا المتتبّع شخصي فقط، لا يُرسل شيئاً نيابةً عنك.'
            : 'You apply yourself on the company site — this tracker is personal only and never sends anything on your behalf.'}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={isAr ? 'اسم الشركة' : 'Company name'}
            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal-300/40"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder={isAr ? 'المسمى الوظيفي' : 'Role title'}
            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal-300/40"
          />
          <button
            type="button"
            onClick={() => void create()}
            disabled={saving || !companyName.trim() || !role.trim()}
            className="mq-btn mq-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isAr ? 'إضافة' : 'Add'}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="min-w-[220px] flex-1 rounded-2xl border border-white/10 bg-white/[0.02] p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {isAr ? col.ar : col.en}
              </h3>
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">
                {byStatus[col.key].length}
              </span>
            </div>
            <ul className="space-y-2">
              {byStatus[col.key].map((app) => (
                <li
                  key={app.id}
                  className="rounded-xl border border-white/10 bg-black/25 p-3"
                >
                  <p className="text-sm font-medium text-white">{app.companyName}</p>
                  <p className="mt-0.5 text-xs text-white/50">{app.role}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => void move(app.id, e.target.value as AppStatus)}
                      className="flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[11px] text-white/80 outline-none"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {isAr ? c.ar : c.en}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void remove(app.id)}
                      className="rounded-lg border border-white/10 p-1.5 text-white/40 hover:border-rose-400/40 hover:text-rose-300"
                      aria-label={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
