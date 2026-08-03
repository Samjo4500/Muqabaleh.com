'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Wallet, CheckCircle2, ArrowUpRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SkeletonBlock } from '@/components/brand';
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

interface EarningsData {
  totalEarnings: number;
  platformFees: number;
  netIncome: number;
  sessionsCompleted: number;
  currentBalance: number;
}  
/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' as const },
  }),
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EarningsPage() {
  const t = useTranslations('interviewerDash');
  const locale = useLocale();

  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interviewer/earnings');
      if (res.ok) {
        const json = await res.json();
        setData({
          totalEarnings: json.totalEarnings || 0,
          platformFees: json.platformFees || 0,
          netIncome: json.netIncome || 0,
          sessionsCompleted: json.sessionsCompleted || 0,
          currentBalance: json.currentBalance || json.netIncome || 0,
        });
      }
    } catch {
      // Silent fail - show zeros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const stats = data || {
    totalEarnings: 0,
    platformFees: 0,
    netIncome: 0,
    sessionsCompleted: 0,
    currentBalance: 0,
  };

  const statCards = [
    { value: formatCents(stats.totalEarnings), labelKey: 'totalEarnings' as const, icon: DollarSign, color: 'text-gold' },
    { value: formatCents(stats.platformFees), labelKey: 'platformFees' as const, icon: TrendingDown, color: 'text-red-400' },
    { value: formatCents(stats.netIncome), labelKey: 'netIncome' as const, icon: Wallet, color: 'text-emerald-400' },
    { value: String(stats.sessionsCompleted), labelKey: 'sessionsCompleted' as const, icon: CheckCircle2, color: 'text-white' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gold md:text-3xl">
        {t('earnings')}
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} lines={2} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
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
      )}

      {/* Current balance */}
      {loading ? (
        <SkeletonBlock lines={2} className="h-24 rounded-xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0B0F17] border border-[rgba(212,175,55,0.15)] rounded-xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">{t('currentBalance')}</p>
              <p className="text-3xl font-bold text-gold">{formatCents(stats.currentBalance)}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {t('disbursedOn')} {new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', day: 'numeric' })}
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
      )}

      {/* Payout history - empty for now */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-[#0B0F17] rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-base font-semibold text-white">{t('payoutHistory')}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Wallet size={32} strokeWidth={1.75} className="text-[var(--text-faint)] mb-3" />
          <p className="text-sm text-[var(--text-muted)]">
            {locale === 'ar' ? 'لا توجد عمليات صرف بعد' : 'No payout history yet'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
