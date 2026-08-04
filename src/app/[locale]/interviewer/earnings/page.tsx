'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import {
  Wallet,
  DollarSign,
  ArrowDownCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { GlowCard } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  totalWithdrawn: number;
  availableBalance: number;
  sessionsCompleted: number;
  payoutEmail: string | null;
}

interface PayoutRecord {
  id: string;
  amount: number;
  paypalEmail: string;
  status: string;
  adminNote: string | null;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MIN_PAYOUT_CENTS = 5000;

function formatCents(cents: number, locale?: string): string {
  return `$${(cents / 100).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function statusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
    case 'PROCESSING':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-400';
    case 'COMPLETED':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    case 'REJECTED':
      return 'border-red-500/30 bg-red-500/10 text-red-400';
    default:
      return 'border-white/10 bg-white/5 text-[var(--text-muted)]';
  }
}

function statusLabel(t: ReturnType<typeof useTranslations>, status: string): string {
  switch (status) {
    case 'PENDING':
      return t('statusPending');
    case 'PROCESSING':
      return t('statusProcessing');
    case 'COMPLETED':
      return t('statusCompleted');
    case 'REJECTED':
      return t('statusRejected');
    default:
      return status;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EarningsPage() {
  const t = useTranslations('interviewerPanel');
  const tp = useTranslations('payouts');
  const locale = useLocale();

  /* ---- data state ---- */
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---- dialog state ---- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [amountDollars, setAmountDollars] = useState('');
  const [emailError, setEmailError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ---- fetch ---- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [earningsRes, payoutsRes] = await Promise.all([
        fetch('/api/interviewer/earnings'),
        fetch('/api/interviewer/payouts'),
      ]);

      if (!earningsRes.ok) {
        const errData = await earningsRes.json().catch(() => ({}));
        setError(errData?.error || 'Failed to load earnings');
        return;
      }

      const earningsData = await earningsRes.json();
      setEarnings(earningsData);

      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        setPayouts(payoutsData.payouts || []);
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- dialog helpers ---- */
  const openDialog = () => {
    if (!earnings) return;
    setPaypalEmail(earnings.payoutEmail || '');
    setAmountDollars((earnings.availableBalance / 100).toFixed(2));
    setEmailError('');
    setAmountError('');
    setDialogOpen(true);
  };

  const handleRequestPayout = async () => {
    let hasError = false;

    if (!isValidEmail(paypalEmail)) {
      setEmailError(tp('invalidEmail'));
      hasError = true;
    } else {
      setEmailError('');
    }

    const dollars = parseFloat(amountDollars);
    const cents = Math.round(dollars * 100);

    if (isNaN(dollars) || dollars <= 0 || cents < MIN_PAYOUT_CENTS) {
      setAmountError(tp('invalidAmount'));
      hasError = true;
    } else if (earnings && cents > earnings.availableBalance) {
      setAmountError(tp('insufficientBalance'));
      hasError = true;
    } else {
      setAmountError('');
    }

    if (hasError) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/interviewer/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cents, paypalEmail }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || tp('requestError'));
        return;
      }

      toast.success(tp('requestSuccess'));
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error(tp('requestError'));
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- locale-aware date formatter ---- */
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /* ================================================================ */
  /*  LOADING                                                          */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg bg-white/10" />

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 rounded bg-white/10" />
                  <Skeleton className="h-7 w-28 rounded bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="h-6 w-32 rounded bg-white/10" />

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-full rounded bg-white/[0.06]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  ERROR                                                            */
  /* ================================================================ */

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('earningsTitle')}
        </h1>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <Button
            variant="ghost"
            onClick={fetchData}
            className="mt-4 text-gold hover:text-gold/80"
          >
            <RefreshCw size={16} className="me-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  MAIN                                                             */
  /* ================================================================ */

  if (!earnings) return null;

  const canPayout = earnings.availableBalance >= MIN_PAYOUT_CENTS;

  const statCards = [
    {
      label: t('availableBalance'),
      value: formatCents(earnings.availableBalance, locale),
      icon: Wallet,
      color: 'text-[var(--gold)]',
      bgColor: 'bg-[var(--gold)]/10',
      borderColor: 'border-[var(--gold)]/20',
      primary: true,
    },
    {
      label: t('totalEarnings'),
      value: formatCents(earnings.totalEarnings, locale),
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      borderColor: 'border-emerald-400/20',
    },
    {
      label: t('paidEarnings'),
      value: formatCents(earnings.totalWithdrawn, locale),
      icon: ArrowDownCircle,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Title ---- */}
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('earningsTitle')}
      </h1>

      {/* ---- Stat Cards ---- */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlowCard key={stat.label}>
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${stat.bgColor} ${stat.borderColor} ${stat.color}`}
                >
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </div>

              {/* Payout button on the primary card */}
              {stat.primary && (
                <div className="mt-4">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-[var(--gold)] text-[var(--bg-void)] hover:bg-[var(--gold)]/85"
                        disabled={!canPayout}
                        onClick={openDialog}
                      >
                        <Wallet size={16} className="me-2" />
                        {t('requestPayout')}
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="glass-card border-white/10 sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-[var(--text-primary)]">
                          {t('requestPayout')}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="mt-4 space-y-5">
                        {/* Balance display */}
                        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                          <p className="text-sm text-[var(--text-muted)]">
                            {t('availableBalance')}
                          </p>
                          <p className="text-2xl font-bold text-[var(--gold)]">
                            {formatCents(earnings.availableBalance, locale)}
                          </p>
                        </div>

                        {/* PayPal Email */}
                        <div className="space-y-2">
                          <Label className="text-[var(--text-muted)]">
                            {t('paypalEmail')}
                          </Label>
                          <Input
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => {
                              setPaypalEmail(e.target.value);
                              if (emailError) setEmailError('');
                            }}
                            placeholder="interviewer@example.com"
                            className="border-white/10 bg-white/[0.04] text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                          />
                          {emailError && (
                            <p className="text-xs text-red-400">{emailError}</p>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                          <Label className="text-[var(--text-muted)]">
                            {t('payoutAmount')}
                          </Label>
                          <div className="relative">
                            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="50"
                              max={(earnings.availableBalance / 100).toFixed(2)}
                              value={amountDollars}
                              onChange={(e) => {
                                setAmountDollars(e.target.value);
                                if (amountError) setAmountError('');
                              }}
                              className="ps-7 border-white/10 bg-white/[0.04] text-[var(--text-primary)]"
                            />
                          </div>
                          {amountError && (
                            <p className="text-xs text-red-400">{amountError}</p>
                          )}
                          <p className="text-xs text-[var(--text-faint)]">
                            {t('minimumNote')} ($50.00)
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                          <Button
                            variant="ghost"
                            className="flex-1 border border-white/10 text-[var(--text-muted)] hover:bg-white/5"
                            onClick={() => setDialogOpen(false)}
                            disabled={submitting}
                          >
                            {tp('cancel')}
                          </Button>
                          <Button
                            className="flex-1 bg-[var(--gold)] text-[var(--bg-void)] hover:bg-[var(--gold)]/85"
                            onClick={handleRequestPayout}
                            disabled={submitting}
                          >
                            {submitting && (
                              <Loader2
                                size={16}
                                className="me-2 animate-spin"
                              />
                            )}
                            {tp('request')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {!canPayout && (
                    <p className="mt-2 text-center text-xs text-[var(--text-faint)]">
                      {t('insufficientBalance')}
                    </p>
                  )}
                </div>
              )}
            </GlowCard>
          );
        })}
      </div>

      {/* ---- Sessions completed ---- */}
      <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
        <CheckCircle2 size={16} className="text-emerald-400" />
        <span>
          {earnings.sessionsCompleted.toLocaleString()} sessions completed
        </span>
      </div>

      {/* ---- Payout History ---- */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {t('payoutHistory')}
        </h2>

        <GlowCard className="!p-0 overflow-hidden">
          {payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Wallet
                size={40}
                strokeWidth={1.5}
                className="text-[var(--text-faint)]"
              />
              <p className="text-sm text-[var(--text-muted)]">
                {t('noPayoutsYet')}
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.08] hover:bg-transparent">
                    <TableHead className="text-[var(--text-muted)]">
                      {t('colRequested')}
                    </TableHead>
                    <TableHead className="text-[var(--text-muted)]">
                      {t('colAmount')}
                    </TableHead>
                    <TableHead className="text-[var(--text-muted)]">
                      {t('colPaypalEmail')}
                    </TableHead>
                    <TableHead className="text-[var(--text-muted)]">
                      {t('colStatus')}
                    </TableHead>
                    <TableHead className="text-[var(--text-muted)]">
                      {t('colCompleted')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow
                      key={payout.id}
                      className="border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      <TableCell className="text-[var(--text-primary)]">
                        {formatDate(payout.requestedAt)}
                      </TableCell>
                      <TableCell className="font-medium text-[var(--gold)]">
                        {formatCents(payout.amount, locale)}
                      </TableCell>
                      <TableCell className="text-[var(--text-muted)]">
                        {payout.paypalEmail}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor(payout.status)}>
                          {statusLabel(t, payout.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[var(--text-muted)]">
                        {payout.completedAt
                          ? formatDate(payout.completedAt)
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
