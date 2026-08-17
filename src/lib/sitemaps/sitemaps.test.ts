import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { escapeXml, sitemapIndexXml, urlsetXml } from './xml';
import { buildStaticSitemapEntries, sitemapIndexLocs } from './static-urls';
import { pickTopSlugs } from '@/lib/interview-guides/top-slugs';

describe('sitemap xml', () => {
  it('escapes loc values', () => {
    assert.equal(escapeXml('a&b<c>"d"'), 'a&amp;b&lt;c&gt;&quot;d&quot;');
  });

  it('wraps a urlset', () => {
    const xml = urlsetXml([
      {
        loc: 'https://muqabaleh.com/jobs',
        lastmod: '2026-08-15',
        changefreq: 'daily',
        priority: '0.9',
      },
    ]);
    assert.match(xml, /<urlset /);
    assert.match(xml, /https:\/\/muqabaleh.com\/jobs/);
    assert.match(xml, /<lastmod>2026-08-15<\/lastmod>/);
  });

  it('builds a sitemap index', () => {
    const xml = sitemapIndexXml([{ loc: 'https://muqabaleh.com/sitemap-jobs.xml' }]);
    assert.match(xml, /<sitemapindex /);
    assert.match(xml, /sitemap-jobs.xml/);
  });

  it('keeps static marketing URLs out of the jobs file', () => {
    const entries = buildStaticSitemapEntries('2026-08-15T00:00:00.000Z');
    assert.ok(entries.some((e) => e.url.endsWith('/about')));
    assert.ok(entries.some((e) => e.url.endsWith('/how-scores-work')));
    assert.ok(entries.some((e) => e.url.includes('/en/how-scores-work')));
    assert.ok(entries.some((e) => e.url.includes('/en/jobs')));
    assert.ok(!entries.some((e) => e.url.includes('/companies/careem/')));
    const index = sitemapIndexLocs('2026-08-15');
    assert.ok(index.some((x) => x.loc.endsWith('/sitemap-jobs.xml')));
    assert.ok(index.some((x) => x.loc.endsWith('/sitemap-interview-guides.xml')));
  });
});

describe('build-time guide slug cap', () => {
  it('takes ranked slugs first then catalog fallback, unique, limited', () => {
    assert.deepEqual(
      pickTopSlugs(['tamara', 'careem'], ['careem', 'noon', 'stc'], 3),
      ['tamara', 'careem', 'noon'],
    );
    assert.deepEqual(pickTopSlugs([], ['careem', 'noon'], 1), ['careem']);
  });
});
