'use client';

import { useTranslations } from 'next-intl';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/brand';
import { toast } from 'sonner';

const INVOICES = [
  { date: 'inv1Date', desc: 'inv1Desc', amount: 'inv1Amount', status: 'inv1Status' },
  { date: 'inv2Date', desc: 'inv2Desc', amount: 'inv2Amount', status: 'inv2Status' },
  { date: 'inv3Date', desc: 'inv3Desc', amount: 'inv3Amount', status: 'inv3Status' },
  { date: 'inv4Date', desc: 'inv4Desc', amount: 'inv4Amount', status: 'inv4Status' },
  { date: 'inv5Date', desc: 'inv5Desc', amount: 'inv5Amount', status: 'inv5Status' },
] as const;

export default function BillingPage() {
  const t = useTranslations('b2b.billing');
  const tCommon = useTranslations('common');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      {/* Balance Card */}
      <GlowCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)]">{t('balance')}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[var(--aurora-2)]">15</span>
              <span className="text-sm text-[var(--text-muted)]">{t('interviews')}</span>
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
            <CreditCard size={28} strokeWidth={1.75} className="text-[var(--aurora-2)]" />
          </div>
        </div>
        <div className="mt-6">
          <Button
            onClick={() => toast.info(tCommon('comingSoon'))}
            className="glass-button cursor-pointer"
          >
            {t('buyMore')}
          </Button>
        </div>
      </GlowCard>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('colDate')}</th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('colDescription')}</th>
              <th className="px-4 py-3 text-end font-medium text-[var(--text-muted)]">{t('colAmount')}</th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">{t('colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv, i) => {
              const isPaid = t(inv.status) === t('statusPaid');
              return (
                <tr
                  key={i}
                  className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 text-[var(--text-faint)]">{t(inv.date)}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{t(inv.desc)}</td>
                  <td className="px-4 py-3 text-end font-medium text-[var(--text-primary)]">{t(inv.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant="outline"
                      className={
                        isPaid
                          ? 'border-emerald/30 bg-emerald/10 text-emerald'
                          : 'border-amber/30 bg-amber/10 text-amber'
                      }
                    >
                      {t(inv.status)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
