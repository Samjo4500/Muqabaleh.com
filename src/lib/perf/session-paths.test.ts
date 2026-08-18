import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pathNeedsSession } from './session-paths';

describe('pathNeedsSession', () => {
  it('skips marketing home, jobs, and guides', () => {
    for (const p of ['/', '/en', '/jobs', '/en/jobs', '/interview-guide/careem', '/interviewers', '/partners']) {
      assert.equal(pathNeedsSession(p), false, p);
    }
  });

  it('keeps session on pricing, auth, and the interview engine', () => {
    for (const p of ['/pricing', '/en/auth/signin', '/interview/prep', '/app', '/partner/billing']) {
      assert.equal(pathNeedsSession(p), true, p);
    }
  });
});
