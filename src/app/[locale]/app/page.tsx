import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  Hand,
  Flame,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { GlowCard, CountUpStat, EmptyState } from '@/components/brand';
import { NewInterviewForm } from './new-interview-form';

/* ------------------------------------------------------------------ */
/*  Status badge (kept inline – no client interactivity needed)       */
/* ------------------------------------------------------------------ */
function StatusBadge({
  status,
  labelCompleted,
  labelInProgress,
  labelPending,
  labelFailed,
}: {
  status: string;
  labelCompleted: string;
  labelInProgress: string;
  labelPending: string;
  labelFailed: string;
}) {
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald">
        <CheckCircle2 size={12} strokeWidth={1.75} />
        {labelCompleted}
      </span>
    );
  }
  if (status === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-medium text-amber">
        <Clock size={12} strokeWidth={1.75} />
        {labelInProgress}
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-[var(--text-muted)]">
        <Clock size={12} strokeWidth={1.75} />
        {labelPending}
      </span>
    );
  }
  /* EVALUATION_FAILED or anything else */
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
      <AlertTriangle size={12} strokeWidth={1.75} />
      {labelFailed}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Industry / type human-readable mapper                              */
/* ------------------------------------------------------------------ */
const INDUSTRY_LABELS: Record<string, { ar: string; en: string }> = {
  IT: { ar: 'تقنية المعلومات', en: 'IT' },
  FINANCE: { ar: 'المالية', en: 'Finance' },
  MEDICINE: { ar: 'الطب', en: 'Medicine' },
  ENGINEERING: { ar: 'الهندسة', en: 'Engineering' },
  EDUCATION: { ar: 'التعليم', en: 'Education' },
  MARKETING: { ar: 'التسويق', en: 'Marketing' },
  SALES: { ar: 'المبيعات', en: 'Sales' },
  HR: { ar: 'الموارد البشرية', en: 'HR' },
};

const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  BEHAVIORAL: { ar: 'سلوكية', en: 'Behavioral' },
  TECHNICAL: { ar: 'تقنية', en: 'Technical' },
};

function industryLabel(code: string, locale: string) {
  const entry = INDUSTRY_LABELS[code];
  return entry ? (entry[locale as 'ar' | 'en'] ?? entry.ar) : code;
}

function typeLabel(code: string, locale: string) {
  const entry = TYPE_LABELS[code];
  return entry ? (entry[locale as 'ar' | 'en'] ?? entry.ar) : code;
}

/* ------------------------------------------------------------------ */
/*  Server page                                                        */
/* ------------------------------------------------------------------ */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('app.dashboard');

  /* ---- Auth guard ---- */
  const session = await requireAuth();
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/signin`);
  }

  /* ---- Fetch user ---- */
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  const displayName = user.name ?? session.user.email?.split('@')[0] ?? '—';
  const sessionsLeft = user.sessionsLeft ?? 0;

  /* ---- Fetch interviews ---- */
  const interviews = await db.interview.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      messages: { take: 1, orderBy: { createdAt: 'asc' } },
    },
  });

  /* ---- Compute stats ---- */
  const completedInterviews = interviews.filter((i) => i.status === 'COMPLETED');
  const completedCount = completedInterviews.length;
  const avgScore =
    completedCount > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.overallScore ?? 0), 0) /
            completedCount,
        )
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome */}
      <div className="flex items-center gap-3">
        <Hand size={24} strokeWidth={1.75} className="text-gold" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('welcome', { name: displayName })}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <GlowCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] mb-2">
            <Flame size={18} strokeWidth={1.75} className="text-gold" />
            <span className="text-sm">{t('streak')}</span>
          </div>
          <CountUpStat value={String(completedCount)} label="" />
        </GlowCard>
        <GlowCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] mb-2">
            <BarChart3 size={18} strokeWidth={1.75} className="text-gold" />
            <span className="text-sm">{t('avgScore')}</span>
          </div>
          <CountUpStat value={String(avgScore)} label="" />
        </GlowCard>
        <GlowCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] mb-2">
            <CheckCircle2 size={18} strokeWidth={1.75} className="text-emerald" />
            <span className="text-sm">{t('completed')}</span>
          </div>
          <CountUpStat value={String(completedCount)} label="" />
        </GlowCard>
        <GlowCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gold mb-2">
            <Clock size={18} strokeWidth={1.75} />
            <span className="text-sm">{t('remaining')}</span>
          </div>
          <CountUpStat value={String(sessionsLeft)} label="" />
        </GlowCard>
      </div>

      {/* Buy package CTA if 0 sessions */}
      {sessionsLeft === 0 && (
        <GlowCard className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle size={40} strokeWidth={1.75} className="text-amber mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            {t('buyPackage')}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md">
            {t('buyPackageSub')}
          </p>
          <Link href="/app/packages" className="btn-gold text-sm">
            {t('buyPackage')}
          </Link>
        </GlowCard>
      )}

      {/* New interview form (client component) */}
      <GlowCard className="p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          {t('newInterview')}
        </h2>
        <NewInterviewForm sessionsLeft={sessionsLeft} />
      </GlowCard>

      {/* Recent interviews table */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          {t('recentInterviews')}
        </h2>

        {interviews.length === 0 ? (
          <GlowCard className="p-8">
            <EmptyState
              icon={<MessageSquare size={40} strokeWidth={1.75} />}
              title={t('recentInterviews')}
            />
          </GlowCard>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                  <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">
                    {t('industry')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">
                    {t('status')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">
                    {t('score')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">
                    {t('date')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview) => (
                  <tr
                    key={interview.id}
                    className="border-b border-white/[0.05] last:border-0 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      <div>{industryLabel(interview.industry, locale)}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {typeLabel(interview.type, locale)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={interview.status}
                        labelCompleted={t('statusCompleted')}
                        labelInProgress={t('statusInProgress')}
                        labelPending={t('statusPending')}
                        labelFailed={t('statusFailed')}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {interview.overallScore !== null ? (
                        <span
                          className={`font-bold ${
                            interview.overallScore >= 80 ? 'text-emerald' : 'text-amber'
                          }`}
                        >
                          {interview.overallScore}
                        </span>
                      ) : (
                        <span className="text-[var(--text-faint)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {interview.createdAt.toLocaleDateString(
                        locale === 'ar' ? 'ar-SA' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        },
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
