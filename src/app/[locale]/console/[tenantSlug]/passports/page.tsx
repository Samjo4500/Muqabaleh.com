'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import type { ConsolePassport } from '@/lib/console/types';
import { ScoreBadge } from '@/components/console/score-badge';
import { useConsoleA11y } from '@/components/console/console-a11y';

export default function PassportsListPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const ta = useTranslations('console.a11y');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { simpleMode } = useConsoleA11y();
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
        <h2 className="mq-console-title text-[1.65rem]">{t('passportsTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('compareHint')}</p>
      </div>

      <div className="space-y-2" role="list" aria-label={ta('candidateList')}>
        {passports.map((p) => {
          const href = localePath(`/console/${tenantSlug}/passports/${p.id}`, locale);
          const name = isAr && p.candidateNameAr ? p.candidateNameAr : p.candidateName;
          return (
          <div
            key={p.id}
            role="listitem"
            tabIndex={0}
            data-passport-row
            data-passport-id={p.id}
            data-passport-name={name}
            data-passport-href={href}
            className="mq-console-card flex flex-wrap items-center gap-3 p-3"
          >
            {!simpleMode ? (
              <input
                type="checkbox"
                checked={compare.includes(p.id)}
                onChange={() => toggle(p.id)}
                className="h-4 w-4 accent-[var(--c-primary)]"
                aria-label={t('compare')}
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--c-text)]">{name}</p>
              <p className="text-xs text-[var(--c-text-2)]">
                {isAr ? p.roleAr || p.role : p.role}
              </p>
            </div>
            <ScoreBadge score={p.score} grade={p.grade} />
            <Link href={href} className="mq-console-btn-ghost text-sm">
              {t('view')}
            </Link>
          </div>
          );
        })}
      </div>

      {!simpleMode && compared.length >= 2 ? (
        <section className="mq-console-surface overflow-x-auto rounded-xl p-4">
          <h3 className="mb-3 text-lg font-medium text-[var(--c-text)]">{t('compareMode')}</h3>
          <table className="w-full min-w-[560px] text-sm" aria-label={ta('candidateList')}>
            <thead>
              <tr className="text-[var(--c-text-2)]">
                <th scope="col" className="p-2 text-start">{t('feature')}</th>
                {compared.map((p) => (
                  <th key={p.id} scope="col" className="p-2 text-start">
                    {p.candidateName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[var(--c-text)]">
              <tr className="border-t border-[var(--c-border)]">
                <th scope="row" className="p-2 text-start font-normal">{t('kpiAvgScore')}</th>
                {compared.map((p) => (
                  <td key={p.id} className="p-2">
                    <ScoreBadge score={p.score} compact />
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
