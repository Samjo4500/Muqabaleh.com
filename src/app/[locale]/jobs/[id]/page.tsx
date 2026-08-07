import { redirect } from 'next/navigation';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import { localePath } from '@/i18n/navigation';

/** Legacy /jobs/:id → company/job path when known; else jobs board. */
export default async function JobIdRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const demo = DEMO_JOBS.find((j) => j.id === id);
  if (demo) {
    redirect(localePath(`/companies/${demo.company.slug}/${demo.slug}`, locale));
  }
  redirect(localePath('/jobs', locale));
}
