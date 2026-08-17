import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

/** Alias for emails that still link to /dashboard. The candidate home is /app. */
export default async function DashboardAliasPage({ params }: Props) {
  const { locale } = await params;
  redirect(locale === 'en' ? '/en/app' : '/app');
}
