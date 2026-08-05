import { setRequestLocale } from 'next-intl/server';
import { TalentClient } from './talent-client';

export default async function TalentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TalentClient />;
}
