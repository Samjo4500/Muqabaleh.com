import { redirect } from 'next/navigation';

/** Talent registration now lives on the unified Available Vacancies page. */
export default async function TalentRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/jobs?tab=candidates`);
}
