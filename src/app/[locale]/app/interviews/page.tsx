import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { InterviewsClient, type InterviewRow } from './interviews-client';

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
export default async function InterviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('app.interviews');

  /* ---- Auth guard ---- */
  const session = await requireAuth();
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/signin`);
  }

  /* ---- Fetch interviews ---- */
  const interviews = await db.interview.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  /* ---- Map to client-friendly rows ---- */
  const rows: InterviewRow[] = interviews.map((i) => ({
    id: i.id,
    industry: i.industry,
    industryLabel: industryLabel(i.industry, locale),
    type: i.type,
    typeLabel: typeLabel(i.type, locale),
    status: i.status,
    overallScore: i.overallScore,
    createdAt: i.createdAt.toISOString(),
    locale,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
      <InterviewsClient interviews={rows} locale={locale} />
    </div>
  );
}
