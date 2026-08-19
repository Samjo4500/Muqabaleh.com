import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  emptyVisitorStats,
  isBotUserAgent,
  isMissingRelationError,
  sanitizeVisitLocale,
  sanitizeVisitPath,
  sanitizeVisitorKey,
} from './site-visit-sanitize';

describe('site visit sanitizers', () => {
  it('keeps public paths and strips query/hash', () => {
    assert.equal(sanitizeVisitPath('/en/jobs?utm=1#x'), '/en/jobs');
    assert.equal(sanitizeVisitPath('/'), '/');
    assert.equal(sanitizeVisitPath('/ar'), '/ar');
  });

  it('rejects admin, api, static, and traversal paths', () => {
    assert.equal(sanitizeVisitPath('/admin/dashboard'), null);
    assert.equal(sanitizeVisitPath('/en/admin/users'), null);
    assert.equal(sanitizeVisitPath('/api/health'), null);
    assert.equal(sanitizeVisitPath('/images/hero.webp'), null);
    assert.equal(sanitizeVisitPath('/../etc/passwd'), null);
    assert.equal(sanitizeVisitPath('jobs'), null);
  });

  it('accepts uuid visitor keys only', () => {
    assert.equal(sanitizeVisitorKey('a1b2c3d4-e5f6-7890-abcd-ef1234567890'), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    assert.equal(sanitizeVisitorKey('short'), null);
    assert.equal(sanitizeVisitorKey('has space!!'), null);
  });

  it('normalizes locale and bots', () => {
    assert.equal(sanitizeVisitLocale('en'), 'en');
    assert.equal(sanitizeVisitLocale('fr'), 'ar');
    assert.equal(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)'), true);
    assert.equal(isBotUserAgent('Mozilla/5.0 Chrome/120'), false);
  });

  it('treats missing-table Prisma errors as unavailable, not a crash', () => {
    assert.equal(
      isMissingRelationError(
        new Error('The table `public.site_visits` does not exist in the current database.'),
      ),
      true,
    );
    assert.equal(isMissingRelationError(new Error('unique constraint')), false);
    assert.equal(emptyVisitorStats().available, false);
  });
});
