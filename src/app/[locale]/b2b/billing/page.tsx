'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/brand';
import { localePath } from '@/i18n/navigation';

type BillingPayload = {
  company?: { name: string; plan: string; credits: number };
  payments?: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    packageType: string | null;
    sessionsCredited: number;
    createdAt: string;
  }>;
  topUp?: { href: string };
};

export default function BillingPage() {
  const t = useTranslations('b2b.billing');
  const locale = useLocale();
  const [data, setData] = useState<BillingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/b2b/billing');
        const json = (await res.json()) as BillingPayload & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'Unavailable');
          return;
        }
        setData(json);
      } catch {
        if (!cancelled) setError('Unavailable');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const credits = data?.company?.credits;
  const payments = data?.payments || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      <GlowCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)]">{t('balance')}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-teal-300">
                {credits == null && !error ? (
                  <Loader2 className="animate-spin" size={28} />
                ) : (
                  credits ?? '—'
                )}
              </span>
              <span className="text-sm text-[var(--text-muted)]">{t('interviews')}</span>
            </div>
            {data?.company ? (
              <p className="mt-2 text-xs text-[var(--text-faint)]">{data.company.plan}</p>
            ) : null}
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-400/10">
            <CreditCard size={28} strokeWidth={1.75} className="text-teal-300" />
          </div>
        </div>
        <div className="mt-6">
          <Button asChild className="glass-button cursor-pointer">
            <Link href={localePath('/request-demo?from=b2b-billing', locale)}>
              {t('buyMore')}
            </Link>
          </Button>
        </div>
      </GlowCard>

      <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">
                {t('colDate')}
              </th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">
                {t('colDescription')}
              </th>
              <th className="px-4 py-3 text-end font-medium text-[var(--text-muted)]">
                {t('colAmount')}
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">
                {t('colStatus')}
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[var(--text-muted)]">
                  {error || 'No invoices yet. Request a demo to top up credits.'}
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const paid = String(p.status).toUpperCase() === 'COMPLETED';
                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-[var(--text-faint)]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {p.packageType || 'Company credits'}
                      {p.sessionsCredited
                        ? ` · +${p.sessionsCredited} sessions`
                        : ''}
                    </td>
                    <td className="px-4 py-3 text-end font-medium text-[var(--text-primary)]">
                      {p.currency} {p.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant="outline"
                        className={
                          paid
                            ? 'border-emerald/30 bg-emerald/10 text-emerald'
                            : 'border-amber/30 bg-amber/10 text-amber'
                        }
                      >
                        {paid ? t('statusPaid') : p.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
