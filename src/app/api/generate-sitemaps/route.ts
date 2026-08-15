import { NextRequest, NextResponse } from 'next/server';
import { assertCronAuthorized } from '@/lib/cron-auth';
import { generateAndPersistSitemaps } from '@/lib/sitemaps/generate';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Daily sitemap refresh. Job/guide XML is served by /sitemap-*.xml routes
 * (not during `next build`). Writes to /public when the disk allows it.
 */
export async function GET(req: NextRequest) {
  const authError = assertCronAuthorized(req);
  if (authError) return authError;
  try {
    const result = await generateAndPersistSitemaps();
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[api/generate-sitemaps]', err);
    return NextResponse.json({ ok: false, error: 'Sitemap generate failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
