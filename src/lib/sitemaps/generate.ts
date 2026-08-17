import { writeFile } from 'fs/promises';
import { join } from 'path';
import { buildGuidesSitemapXml } from './guides';
import { buildJobsSitemapXml } from './jobs';
import { sitemapIndexXml, urlsetXml } from './xml';
import { buildStaticSitemapEntries, sitemapIndexLocs } from './static-urls';

export type SitemapGenerateResult = {
  ok: true;
  jobs: number;
  guides: number;
  staticUrls: number;
  wrotePublic: boolean;
};

async function tryWritePublic(name: string, xml: string): Promise<boolean> {
  try {
    await writeFile(join(process.cwd(), 'public', name), xml, 'utf8');
    return true;
  } catch (err) {
    // Vercel serverless filesystem is read-only except /tmp — routes serve live XML.
    console.warn('[sitemaps] public write skipped', name, err);
    return false;
  }
}

/** Build job + guide sitemaps. Persist to /public when the disk is writable. */
export async function generateAndPersistSitemaps(): Promise<SitemapGenerateResult> {
  const [jobs, guides] = await Promise.all([
    buildJobsSitemapXml(),
    buildGuidesSitemapXml(),
  ]);
  const staticEntries = buildStaticSitemapEntries();
  const staticXml = urlsetXml(
    staticEntries.map((e) => ({
      loc: e.url,
      lastmod: e.lastModified.slice(0, 10),
      changefreq: e.changeFrequency,
      priority: String(e.priority),
    })),
  );
  const indexXml = sitemapIndexXml(sitemapIndexLocs());

  const writes = await Promise.all([
    tryWritePublic('sitemap-jobs.xml', jobs.xml),
    tryWritePublic('sitemap-interview-guides.xml', guides.xml),
    tryWritePublic('sitemap-static.xml', staticXml),
    tryWritePublic('sitemap-index.xml', indexXml),
  ]);

  return {
    ok: true,
    jobs: jobs.urls,
    guides: guides.urls,
    staticUrls: staticEntries.length,
    wrotePublic: writes.every(Boolean),
  };
}
