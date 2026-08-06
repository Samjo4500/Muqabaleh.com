import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { buildPassport } from '@/lib/passport';
import { PassportView } from '@/components/passport/passport-view';

export default async function CandidatePassportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAuth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/signin`);
  }

  const passport = await buildPassport(session.user.id);
  if (!passport) {
    redirect(`/${locale}/auth/signin`);
  }

  return <PassportView passport={passport} mode="owner" />;
}
