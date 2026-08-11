'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { scoreColor } from '@/lib/console/defaults';
import type { ConsolePassport } from '@/lib/console/types';

export default function PassportsListPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [passports, setPassports] = useState<ConsolePassport[]>([]);
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/console/${tenantSlug}/passports`)
      .then((r) => r.json())
      .then((j) => setPassports(j.passports || []));
  }, [tenantSlug]);

  const compared = useMemo(
    () => passports.filter((p) => compare.includes(p.id)),
    [passports, compare],
  );

  const toggle = (id: string) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('passportsTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('compareHint')}</p>
      </div>

      <div className="space-y-2">
        {passports.map((p) => (
          <div key={p.id} className="mq-console-card flex flex-wrap items-center gap-3 p-3">
            <input
              type="checkbox"
              checked={compare.includes(p.id)}
              onChange={() => toggle(p.id)}
              className="h-4 w-4 accent-[var(--c-primary)]"
              aria-label={t('compare')}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--c-text)]">{p.candidateName}</p>
              <p className="text-xs text-[var(--c-text-2)]">
                {isAr ? p.roleAr || p.role : p.role}
              </p>
            </div>
            <span
              className="rounded-md px-2 py-1 text-sm font-bold"
              style={{ color: scoreColor(p.score), background: `${scoreColor(p.score)}22` }}
            >
              {p.score} · {p.grade}
            </span>
            <Link
              href={localePath(`/console/${tenantSlug}/passports/${p.id}`, locale)}
              className="mq-console-btn-ghost text-sm"
            >
              {t('view')}
            </Link>
          </div>
        ))}
      </div>

      {compared.length >= 2 ? (
        <section className="mq-console-surface overflow-x-auto rounded-xl p-4">
          <h3 className="mb-3 text-lg font-bold text-[var(--c-text)]">{t('compareMode')}</h3>
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-[var(--c-text-2)]">
                <th className="p-2 text-start">{t('feature')}</th>
                {compared.map((p) => (
                  <th key={p.id} className="p-2 text-start">
                    {p.candidateName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[var(--c-text)]">
              <tr className="border-t border-[var(--c-border)]">
                <td className="p-2">{t('kpiAvgScore')}</td>
                {compared.map((p) => (
                  <td key={p.id} className="p-2 font-bold" style={{ color: scoreColor(p.score) }}>
                    {p.score}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-[var(--c-border)]">
                <td className="p-2">{t('grade')}</td>
                {compared.map((p) => (
                  <td key={p.id} className="p-2">
                    {p.grade}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-[var(--c-border)]">
                <td className="p-2">{t('role')}</td>
                {compared.map((p) => (
                  <td key={p.id} className="p-2">
                    {isAr ? p.roleAr || p.role : p.role}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
