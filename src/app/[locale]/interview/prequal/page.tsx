import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrequalClient } from './prequal-client';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ company?: string; role?: string; job?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr
        ? 'تأهيل المقابلة — مقابلة | Muqabaleh'
        : 'Interview Pre-Qual — Muqabaleh',
    },
    description: isAr
      ? 'خصّص جلسة مقابلة تجريبية حسب دورك ومستواك ولغتك على مقابلة.'
      : 'Tailor your Muqabaleh mock interview session to your role, level, and language.',
    robots: { index: false, follow: false },
  };
}

export default async function PrequalPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const qs = new URLSearchParams();
    if (sp.company) qs.set('company', sp.company);
    if (sp.role) qs.set('role', sp.role);
    if (sp.job) qs.set('job', sp.job);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const dest =
      locale === 'en'
        ? `/en/auth/register?callbackUrl=${encodeURIComponent(`/en/interview/prequal${suffix}`)}`
        : `/auth/register?callbackUrl=${encodeURIComponent(`/interview/prequal${suffix}`)}`;
    redirect(dest);
  }

  return (
    <PrequalClient
      email={session.user.email}
      initialCompany={sp.company}
      initialRole={sp.role}
      initialJobId={sp.job}
    />
  );
}
