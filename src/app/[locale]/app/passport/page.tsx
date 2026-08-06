import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { buildPassport, type PassportPayload } from '@/lib/passport';
import { PassportView } from '@/components/passport/passport-view';

function emptyPassport(userId: string, name?: string | null): PassportPayload {
  return {
    userId,
    displayName: name?.trim() || 'Candidate',
    image: null,
    headline: null,
    desiredRole: null,
    country: null,
    industry: null,
    experience: null,
    language: null,
    score: null,
    status: 'interview',
    scoreMax: 100,
    verificationId: null,
    interviewIndustry: null,
    interviewType: null,
    completedAt: null,
    certificates: [],
    isPubliclyVisible: false,
    hasCompletedInterview: false,
  };
}

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

  let passport: PassportPayload;
  try {
    passport =
      (await buildPassport(session.user.id)) ??
      emptyPassport(session.user.id, session.user.name);
  } catch (err) {
    console.error('[passport page]', err);
    passport = emptyPassport(session.user.id, session.user.name);
  }

  return <PassportView passport={passport} mode="owner" />;
}
