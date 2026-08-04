import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { ProfileForm } from './profile-form';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAuth();

  if (!session) {
    redirect(`/${locale}/auth/signin`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      country: true,
      industry: true,
      experience: true,
      interviewerGender: true,
      language: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  return (
    <ProfileForm
      locale={locale}
      user={{
        name: user.name ?? '',
        email: user.email,
        country: user.country,
        industry: user.industry,
        experience: user.experience,
        interviewerGender: user.interviewerGender ?? 'MALE',
        language: user.language ?? 'AR',
      }}
    />
  );
}
