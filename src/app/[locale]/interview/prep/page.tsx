import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrepClient } from './prep-client';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] || '';
  return v || '';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr
        ? 'إعداد المقابلة — جيني | مقابلة'
        : 'Interview prep — Jeannie | Muqabaleh',
    },
    description: isAr
      ? 'جهّز جلسة التدريب الصوتية مع جيني: الدور، القطاع، المستوى، واللغة.'
      : 'Set up your Jeannie voice practice session: role, industry, seniority, and language.',
    robots: { index: false, follow: false },
  };
}

export default async function InterviewPrepPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const company = first(sp.company).trim().slice(0, 120);
  const role = first(sp.role).trim().slice(0, 160);
  const job = first(sp.job).trim().slice(0, 80);
  const qs = new URLSearchParams();
  if (company) qs.set('company', company);
  if (role) qs.set('role', role);
  if (job) qs.set('job', job);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const dest =
      locale === 'en'
        ? `/en/auth/register?callbackUrl=${encodeURIComponent(`/en/interview/prep${suffix}`)}`
        : `/auth/register?callbackUrl=${encodeURIComponent(`/interview/prep${suffix}`)}`;
    redirect(dest);
  }

  return (
    <PrepClient
      initialCompany={company || undefined}
      initialRoleTitle={role || undefined}
      initialJobId={job || undefined}
    />
  );
}
