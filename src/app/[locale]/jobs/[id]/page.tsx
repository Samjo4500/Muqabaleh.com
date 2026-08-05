import { setRequestLocale } from 'next-intl/server';
import { JobDetailClient } from './job-detail-client';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <JobDetailClient jobId={id} />;
}
