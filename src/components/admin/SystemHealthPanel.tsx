'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Radar,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HealthCheckResult, SystemHealthReport } from '@/lib/admin/system-health';

type Props = {
  /** Compact mode for dashboard embed */
  compact?: boolean;
};

const STATUS_META: Record<
  HealthCheckResult['status'],
  { ar: string; en: string; glow: string; text: string; dot: string }
> = {
  pass: {
    ar: 'سليم',
    en: 'Pass',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.35)]',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  fail: {
    ar: 'عطل',
    en: 'Fail',
    glow: 'shadow-[0_0_24px_rgba(251,113,133,0.4)]',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
  },
  warn: {
    ar: 'تحذير',
    en: 'Warn',
    glow: 'shadow-[0_0_24px_rgba(251,191,36,0.35)]',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  skip: {
    ar: 'تخطي',
    en: 'Skip',
    glow: '',
    text: 'text-white/45',
    dot: 'bg-white/30',
  },
};

const OVERALL: Record<
  SystemHealthReport['overall'],
  { ar: string; en: string; ring: string; glow: string; label: string }
> = {
  green: {
    ar: 'النظام سليم',
    en: 'System healthy',
    ring: 'border-emerald-400/50',
    glow: 'bg-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.55)]',
    label: 'text-emerald-200',
  },
  yellow: {
    ar: 'تحذيرات نشطة',
    en: 'Degraded — warnings',
    ring: 'border-amber-400/50',
    glow: 'bg-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.5)]',
    label: 'text-amber-200',
  },
  red: {
    ar: 'أعطال حرجة',
    en: 'Critical issues',
    ring: 'border-rose-400/50',
    glow: 'bg-rose-400 shadow-[0_0_40px_rgba(251,113,133,0.55)]',
    label: 'text-rose-200',
  },
};

export function SystemHealthPanel({ compact }: Props) {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/system-health');
        const data = await res.json();
        if (!cancelled && data.report) {
          setReport(data.report as SystemHealthReport);
          setRevealed((data.report as SystemHealthReport).checks.length);
          setProgress(100);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    setProgress(6);
    setRevealed(0);

    let tick: ReturnType<typeof setInterval> | null = null;
    tick = setInterval(() => {
      setProgress((p) => Math.min(88, p + Math.random() * 7 + 2));
    }, 280);

    try {
      const res = await fetch('/api/admin/system-health', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.report) {
        throw new Error(data.error || 'Check failed');
      }
      const next = data.report as SystemHealthReport;
      setReport(next);
      setProgress(100);

      // Stagger light-up of each check for a sophisticated reveal
      for (let i = 1; i <= next.checks.length; i += 1) {
        await new Promise((r) => setTimeout(r, 90));
        setRevealed(i);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Systems check failed');
      setProgress(0);
    } finally {
      if (tick) clearInterval(tick);
      setRunning(false);
    }
  }, []);

  const overall = report?.overall ?? null;
  const overallMeta = overall ? OVERALL[overall] : null;

  const visibleChecks = useMemo(() => {
    if (!report) return [];
    return report.checks.slice(0, revealed);
  }, [report, revealed]);

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10',
        'bg-gradient-to-br from-[#07131f] via-[#0a1628] to-[#061018]',
        compact ? 'mb-6 p-5' : 'mb-8 p-6 md:p-8',
      )}
    >
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute -start-20 -top-24 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -end-16 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          {/* Master status light */}
          <div
            className={cn(
              'relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-black/30',
              overallMeta?.ring || 'border-white/15',
            )}
          >
            <span
              className={cn(
                'absolute inset-2 rounded-xl opacity-30 blur-md',
                overall === 'green' && 'bg-emerald-400',
                overall === 'yellow' && 'bg-amber-400',
                overall === 'red' && 'bg-rose-400',
                !overall && 'bg-cyan-400/40',
              )}
            />
            <span
              className={cn(
                'relative h-5 w-5 rounded-full transition-all duration-500',
                overallMeta?.glow || 'bg-cyan-300/70 shadow-[0_0_20px_rgba(34,211,238,0.45)]',
                running && 'animate-pulse',
              )}
            />
            {running ? (
              <Radar
                size={14}
                className="absolute bottom-1.5 end-1.5 animate-spin text-cyan-200/80"
              />
            ) : overall === 'green' ? (
              <CheckCircle2 size={14} className="absolute bottom-1.5 end-1.5 text-emerald-300/90" />
            ) : overall === 'red' ? (
              <ShieldAlert size={14} className="absolute bottom-1.5 end-1.5 text-rose-300/90" />
            ) : overall === 'yellow' ? (
              <AlertTriangle size={14} className="absolute bottom-1.5 end-1.5 text-amber-300/90" />
            ) : (
              <Activity size={14} className="absolute bottom-1.5 end-1.5 text-cyan-200/70" />
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200/70">
              <BiInline ar="تشخيص المنصة" en="Platform diagnostics" />
            </p>
            <h2 className={cn('mt-1 text-xl font-bold md:text-2xl', overallMeta?.label || 'text-white')}>
              {overallMeta ? (
                <BiInline ar={overallMeta.ar} en={overallMeta.en} />
              ) : (
                <BiInline ar="جاهز لفحص الأنظمة" en="Ready for systems check" />
              )}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-white/50">
              <BiInline
                ar="فحص حي لقاعدة البيانات وجيني والصوت والبريد والدفع والمصادقة — بنقرة واحدة"
                en="Live probe of database, Jeannie AI, speech, email, payments, and auth in one click."
              />
            </p>
            {report ? (
              <p className="mt-2 text-xs text-white/35">
                <BiInline ar="آخر فحص:" en="Last run:" />{' '}
                {new Date(report.checkedAt).toLocaleString()} · {report.durationMs}ms ·{' '}
                {report.summary.pass}/{report.summary.total}{' '}
                <BiInline ar="سليم" en="pass" />
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="button"
          onClick={() => void run()}
          disabled={running}
          className={cn(
            'relative min-h-[48px] gap-2 overflow-hidden rounded-2xl px-5 font-bold',
            'bg-gradient-to-r from-teal-400 to-cyan-300 text-slate-950',
            'hover:from-teal-300 hover:to-cyan-200',
            'shadow-[0_0_30px_rgba(45,212,191,0.25)]',
          )}
        >
          {running ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          <BiInline
            ar={running ? 'جارٍ فحص الأنظمة…' : 'تشغيل فحص الأنظمة'}
            en={running ? 'Running systems check…' : 'Run systems check'}
          />
        </Button>
      </div>

      {/* Progress */}
      <div className="relative mt-6">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-white/40">
          <span>
            <BiInline ar="تقدّم الفحص" en="Scan progress" />
          </span>
          <span className="tabular-nums text-cyan-200/80">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-300 ease-out',
              overall === 'red'
                ? 'bg-gradient-to-r from-rose-500 to-rose-300'
                : overall === 'yellow'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                  : 'bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-300',
              running && 'animate-pulse',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error ? (
        <p className="relative mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      {/* Check lights grid */}
      <div
        className={cn(
          'relative mt-6 grid gap-3',
          compact ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-4',
        )}
      >
        {(report?.checks || []).map((check, idx) => {
          const visible = idx < revealed;
          const meta = STATUS_META[check.status];
          return (
            <div
              key={check.id}
              className={cn(
                'rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm transition-all duration-500',
                visible ? 'opacity-100 translate-y-0' : 'opacity-25 translate-y-1',
                visible && meta.glow,
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      visible ? meta.dot : 'bg-white/20',
                      visible && check.status === 'pass' && 'animate-pulse',
                    )}
                  />
                  <span className="text-sm font-semibold text-white/90">
                    <BiInline ar={check.label.ar} en={check.label.en} />
                  </span>
                </div>
                {visible ? (
                  check.status === 'pass' ? (
                    <CheckCircle2 size={15} className="text-emerald-300" />
                  ) : check.status === 'fail' ? (
                    <XCircle size={15} className="text-rose-300" />
                  ) : check.status === 'warn' ? (
                    <AlertTriangle size={15} className="text-amber-300" />
                  ) : null
                ) : running ? (
                  <Loader2 size={14} className="animate-spin text-white/30" />
                ) : null}
              </div>
              <p className={cn('text-xs font-bold uppercase tracking-wide', visible ? meta.text : 'text-white/25')}>
                {visible ? <BiInline ar={meta.ar} en={meta.en} /> : '—'}
                {check.critical ? (
                  <span className="ms-2 text-[10px] font-medium text-white/30">
                    <BiInline ar="حرج" en="critical" />
                  </span>
                ) : null}
              </p>
              {visible && check.detail ? (
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/40">
                  {check.detail}
                  {typeof check.latencyMs === 'number' ? ` · ${check.latencyMs}ms` : ''}
                </p>
              ) : null}
            </div>
          );
        })}

        {!report && !running ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40">
            <BiInline
              ar={'اضغط تشغيل فحص الأنظمة لبدء التشخيص الحي.'}
              en={'Press Run systems check to start a live diagnostic.'}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
