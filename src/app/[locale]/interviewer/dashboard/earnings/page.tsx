'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Wallet, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PayoutStatus = 'PAID' | 'PENDING';

type PayoutRow = {
  date: string;
  amount: string;
  status: PayoutStatus;
  txId: string;
};

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const statsCards = [
  { value: '$2,340', labelKey: 'totalEarnings', icon: DollarSign, color: 'text-gold' },
  { value: '$468', labelKey: 'platformFees', icon: TrendingDown, color: 'text-red-400' },
  { value: '$1,872', labelKey: 'netIncome', icon: Wallet, color: 'text-emerald-400' },
  { value: '78', labelKey: 'sessionsCompleted', icon: CheckCircle2, color: 'text-white' },
] as const;

const mockMonthlyData = [
  { month: 'يناير', amount: 320 },
  { month: 'فبراير', amount: 410 },
  { month: 'مارس', amount: 380 },
  { month: 'أبريل', amount: 450 },
  { month: 'مايو', amount: 520 },
  { month: 'يونيو', amount: 540 },
];

const mockPayouts: PayoutRow[] = [
  { date: '2025-07-15', amount: '$487', status: 'PENDING', txId: 'TXN-90210' },
  { date: '2025-07-01', amount: '$520', status: 'PAID', txId: 'TXN-87654' },
  { date: '2025-06-15', amount: '$498', status: 'PAID', txId: 'TXN-84321' },
  { date: '2025-06-01', amount: '$410', status: 'PAID', txId: 'TXN-81098' },
  { date: '2025-05-15', amount: '$445', status: 'PAID', txId: 'TXN-77865' },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' },
  }),
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.5, duration: 0.5, ease: 'easeOut' },
  },
};

const chartVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.6, duration: 0.5, ease: 'easeOut' },
  },
};

const tableVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.8, duration: 0.5, ease: 'easeOut' },
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EarningsPage() {
  const t = useTranslations('interviewerDash');
  const locale = useLocale();

  const maxAmount = Math.max(...mockMonthlyData.map((d) => d.amount));

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gold md:text-3xl">
        {t('earnings')}
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.labelKey}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#0B0F17] border border-[rgba(212,175,55,0.1)] rounded-xl p-5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <Icon size={24} strokeWidth={1.75} className="text-gold" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-[var(--text-muted)]">{t(stat.labelKey)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current balance card */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#0B0F17] border border-[rgba(212,175,55,0.15)] rounded-xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">{t('currentBalance')}</p>
            <p className="text-3xl font-bold text-gold">$487</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {locale === 'ar'
                ? `${t('disbursedOn')} ١٥ أغسطس`
                : `${t('disbursedOn')} August 15`}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/20 cursor-pointer"
          >
            <ArrowUpRight size={16} strokeWidth={2} />
            {t('requestEarlyPayout')}
          </button>
        </div>
      </motion.div>

      {/* Bar chart — CSS-only */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#0B0F17] border border-[rgba(212,175,55,0.1)] rounded-xl p-6"
      >
        <h3 className="text-base font-semibold text-white mb-6">
          {locale === 'ar' ? 'الأرباح الشهرية' : 'Monthly Earnings'}
        </h3>

        {/* Chart */}
        <div className="flex items-end gap-3 h-48">
          {mockMonthlyData.map((d) => {
            const heightPercent = (d.amount / maxAmount) * 100;
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                {/* Amount on top */}
                <span className="text-xs text-[var(--text-muted)]">${d.amount}</span>
                {/* Bar */}
                <div className="w-full relative" style={{ height: '160px' }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-gold/80 to-gold/40 transition-all duration-700"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                {/* Label */}
                <span className="text-xs text-[var(--text-muted)]">{d.month}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Payout history table */}
      <motion.div
        variants={tableVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#0B0F17] rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-base font-semibold text-white">{t('payoutHistory')}</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">
                  {locale === 'ar' ? 'التاريخ' : 'Date'}
                </TableHead>
                <TableHead className="text-[var(--text-muted)]">
                  {locale === 'ar' ? 'المبلغ' : 'Amount'}
                </TableHead>
                <TableHead className="text-[var(--text-muted)]">
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </TableHead>
                <TableHead className="text-[var(--text-muted)]">
                  {locale === 'ar' ? 'معرف العملية' : 'Transaction ID'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayouts.map((row, i) => (
                <TableRow
                  key={i}
                  className="border-white/[0.06] hover:bg-white/[0.02]"
                >
                  <TableCell className="text-[var(--text-muted)] font-mono text-sm">
                    {row.date}
                  </TableCell>
                  <TableCell className="font-medium text-white">{row.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        row.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)] font-mono text-xs">
                    {row.txId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
