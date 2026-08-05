import { redirect } from 'next/navigation';
import { localePath } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

export default async function JobsTalentRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(localePath('/portal/jobs?tab=candidates', locale));
}
