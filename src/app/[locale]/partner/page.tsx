'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import type { PartnerDashboard } from '@/lib/partner/types';
import { KpiCard, PageHeader, Panel, money } from '@/components/partner/ui';

export default function PartnerOverviewPage() {
  const t = useTranslations('partnerConsole');
  const locale = useLocale();
  const [data, setData] = useState<PartnerDashboard | null>(null);

  useEffect(() => {
    void fetch('/api/partner/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const max = Math.max(...(data?.usageSeries.map((d) => d.interviews) || [1]), 1);

  return (
    <div>
      <PageHeader
        eyebrow={t('overviewEyebrow')}
        title={t('overviewTitle')}
        description={t('overviewDesc')}
        actions={
          <>
            <Link href={localePath('/partner/clients', locale)} className="pc-btn pc-btn-primary">
              {t('addClient')}
              <ArrowUpRight size={16} />
            </Link>
            <Link href={localePath('/partner/branding', locale)} className="pc-btn pc-btn-ghost">
              {t('navBranding')}
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label={t('kpiClients')} value={String(data?.kpis.clients ?? '—')} />
        <KpiCard label={t('kpiJobs')} value={String(data?.kpis.activeJobs ?? '—')} />
        <KpiCard label={t('kpiInterviews')} value={String(data?.kpis.interviews30d ?? '—')} hint={t('last30')} />
        <KpiCard label={t('kpiCredits')} value={String(data?.kpis.creditsPool ?? '—')} />
        <KpiCard
          label={t('kpiEarnings')}
          value={data ? money(data.kpis.earningsCents30d, data.partner.currency, locale) : '—'}
          hint={t('last30')}
        />
        <KpiCard
          label={t('kpiConversion')}
          value={data ? `${Math.round(data.kpis.conversionRate * 100)}%` : '—'}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title={t('usageTitle')}>
          <div className="flex h-44 items-end gap-1.5">
            {(data?.usageSeries || []).map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[var(--pc-primary)]/30 to-[var(--pc-primary)]"
                  style={{ height: `${Math.max(8, (d.interviews / max) * 100)}%` }}
                  title={`${d.day}: ${d.interviews}`}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">{t('usageHint')}</p>
        </Panel>

        <Panel
          title={t('activityTitle')}
          action={
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--pc-accent)]">
              <Sparkles size={12} />
              {t('live')}
            </span>
          }
        >
          <ul className="space-y-3">
            {(data?.recentActivity || []).map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3"
              >
                <div className="text-sm text-white/85">
                  {locale === 'ar' ? a.titleAr : a.title}
                </div>
                <div className="mt-1 text-[11px] text-white/35">
                  {new Date(a.at).toLocaleString(locale === 'ar' ? 'ar' : 'en')}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
