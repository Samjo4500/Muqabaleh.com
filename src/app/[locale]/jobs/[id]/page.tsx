import { permanentRedirect } from 'next/navigation';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import { localePath } from '@/i18n/navigation';
import { db } from '@/lib/db';

/**
 * Legacy /jobs/:id — 301 to canonical /companies/{company}/{job-slug}.
 * Never serve a separate job detail surface here.
 */
export default async function JobIdRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const key = String(id || '').trim();
  if (!key) {
    permanentRedirect(localePath('/jobs', locale));
  }

  try {
    const row = await db.listedJob.findFirst({
      where: {
        isActive: true,
        OR: [{ id: key }, { slug: key }],
        company: { isActive: true },
      },
      select: {
        slug: true,
        company: { select: { slug: true } },
      },
    });
    if (row?.company?.slug && row.slug) {
      permanentRedirect(
        localePath(`/companies/${row.company.slug}/${row.slug}`, locale),
      );
    }
  } catch (err) {
    console.error('[jobs/[id] redirect]', err);
  }

  const demo = DEMO_JOBS.find((j) => j.id === key || j.slug === key);
  if (demo) {
    permanentRedirect(
      localePath(`/companies/${demo.company.slug}/${demo.slug}`, locale),
    );
  }

  permanentRedirect(localePath('/jobs', locale));
}
