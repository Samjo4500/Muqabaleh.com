import { NextRequest, NextResponse } from 'next/server';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

function jobsBoardUrl(req: NextRequest, locale: string): URL {
  const url = new URL(req.url);
  url.pathname = locale === 'en' ? '/en/jobs' : '/jobs';
  url.search = '';
  return url;
}

function companyJobUrl(
  req: NextRequest,
  locale: string,
  companySlug: string,
  jobSlug: string,
): URL {
  const url = new URL(req.url);
  url.pathname =
    locale === 'en'
      ? `/en/companies/${companySlug}/${jobSlug}`
      : `/companies/${companySlug}/${jobSlug}`;
  url.search = '';
  return url;
}

/**
 * Legacy /jobs/:id — real HTTP 308 to canonical /companies/{company}/{job-slug}.
 * Uses a Route Handler so crawlers get Location (not an RSC soft redirect).
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string; id: string }> },
) {
  const { locale, id } = await ctx.params;
  const key = String(id || '').trim();
  if (!key) {
    return NextResponse.redirect(jobsBoardUrl(req, locale), 308);
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
      return NextResponse.redirect(
        companyJobUrl(req, locale, row.company.slug, row.slug),
        308,
      );
    }
  } catch (err) {
    console.error('[jobs/[id] redirect]', err);
  }

  const demo = DEMO_JOBS.find((j) => j.id === key || j.slug === key);
  if (demo) {
    return NextResponse.redirect(
      companyJobUrl(req, locale, demo.company.slug, demo.slug),
      308,
    );
  }

  return NextResponse.redirect(jobsBoardUrl(req, locale), 308);
}
