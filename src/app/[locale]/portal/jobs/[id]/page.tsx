import { setRequestLocale } from 'next-intl/server';
import { JobDetailClient } from '../../../jobs/[id]/job-detail-client';

export default async function PortalJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <JobDetailClient jobId={id} />;
}
