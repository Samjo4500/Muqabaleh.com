import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArabicSmokeTestClient } from './smoke-client';

/**
 * Quick Arabic smoke-test entry:
 * /interview/test?lang=ar&role=software-engineer
 */
export default async function InterviewSmokeTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const callback = `/${locale === 'ar' ? '' : `${locale}/`}interview/test`.replace(
      '//',
      '/',
    );
    redirect(
      locale === 'ar'
        ? `/auth/signin?callbackUrl=${encodeURIComponent('/interview/test')}`
        : `/${locale}/auth/signin?callbackUrl=${encodeURIComponent(callback)}`,
    );
  }

  const lang = String(sp.lang || 'ar');
  const role = String(sp.role || 'software-engineer');

  return (
    <ArabicSmokeTestClient
      locale={locale}
      language={lang === 'en' ? 'en' : lang === 'mixed' ? 'mixed' : 'ar'}
      roleId={role}
    />
  );
}
