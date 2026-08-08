import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CoachSessionClient } from './coach-session-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr
        ? 'جلسة المقابلة — جيني | مقابلة'
        : 'Interview session — Jeannie | Muqabaleh',
    },
    robots: { index: false, follow: false },
  };
}

/**
 * Jeannie coach live session (in-memory until complete).
 * Dynamic `/interview/session/[sessionId]` remains the bank-question engine.
 */
export default async function CoachSessionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const dest =
      locale === 'en'
        ? `/en/auth/register?callbackUrl=${encodeURIComponent('/en/interview/session')}`
        : `/auth/register?callbackUrl=${encodeURIComponent('/interview/session')}`;
    redirect(dest);
  }

  return (
    <CoachSessionClient
      candidateName={session.user.name || session.user.email.split('@')[0] || 'Candidate'}
    />
  );
}
