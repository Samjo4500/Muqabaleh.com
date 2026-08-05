import { redirect } from 'next/navigation';
import { localePath } from '@/i18n/navigation';
import { B2B_CONSOLE_PREVIEW } from '@/lib/b2b-preview';
import { OnboardingForm } from './onboarding-form';

type Props = { params: Promise<{ locale: string }> };

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  if (B2B_CONSOLE_PREVIEW) {
    redirect(localePath('/request-demo?from=b2b-onboarding', locale));
  }
  return <OnboardingForm />;
}
