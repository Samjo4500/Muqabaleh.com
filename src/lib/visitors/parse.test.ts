import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  bounceRate,
  isBotUserAgent,
  isStaffPath,
  isVisitorId,
  normalizePath,
  pagesPerSession,
  parseBrowser,
  parseDevice,
  parseOs,
  parseUtm,
  referrerHostOf,
  shouldTrackPath,
} from './parse';

describe('visitor parse', () => {
  it('detects bots and devices', () => {
    assert.equal(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)'), true);
    assert.equal(isBotUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit'), false);
    assert.equal(parseDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)'), 'mobile');
    assert.equal(parseDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)'), 'desktop');
    assert.equal(parseBrowser('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36'), 'Chrome');
    assert.equal(parseOs('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)'), 'macOS');
  });

  it('normalizes locale-prefixed paths and skips assets', () => {
    assert.equal(normalizePath('/en/about'), '/about');
    assert.equal(normalizePath('/interview-guide/careem'), '/interview-guide/careem');
    assert.equal(shouldTrackPath('/api/visitors/collect'), false);
    assert.equal(shouldTrackPath('/favicon.ico'), false);
    assert.equal(shouldTrackPath('/en/jobs'), true);
    assert.equal(isStaffPath('/en/admin/visitors'), true);
    assert.equal(isStaffPath('/jobs'), false);
  });

  it('parses referrers and UTM', () => {
    assert.equal(referrerHostOf('https://www.google.com/search?q=muqabaleh'), 'google.com');
    assert.equal(referrerHostOf('https://muqabaleh.com/en', 'muqabaleh.com'), 'direct');
    assert.deepEqual(parseUtm('?utm_source=newsletter&utm_medium=email&utm_campaign=launch'), {
      utmSource: 'newsletter',
      utmMedium: 'email',
      utmCampaign: 'launch',
    });
  });

  it('computes bounce and pages/session', () => {
    assert.equal(bounceRate(10, 4), 40);
    assert.equal(bounceRate(0, 0), 0);
    assert.equal(pagesPerSession(25, 10), 2.5);
    assert.equal(isVisitorId('a'.repeat(32)), true);
    assert.equal(isVisitorId('short'), false);
  });
});
