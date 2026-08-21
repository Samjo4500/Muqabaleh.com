import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isSuperAdminEmail, SUPER_ADMIN_EMAILS } from './constants';

describe('isSuperAdminEmail', () => {
  it('recognizes sam@muqabaleh.com and samjo4500@gmail.com regardless of casing or whitespace', () => {
    assert.equal(isSuperAdminEmail('sam@muqabaleh.com'), true);
    assert.equal(isSuperAdminEmail('Sam@Muqabaleh.com'), true);
    assert.equal(isSuperAdminEmail('  sam@muqabaleh.com  '), true);
    assert.equal(isSuperAdminEmail('SAM@MUQABALEH.COM'), true);

    assert.equal(isSuperAdminEmail('samjo4500@gmail.com'), true);
    assert.equal(isSuperAdminEmail('SamJo4500@Gmail.Com'), true);
  });

  it('rejects regular users, invalid emails, and empty values', () => {
    assert.equal(isSuperAdminEmail('candidate@example.com'), false);
    assert.equal(isSuperAdminEmail('other@muqabaleh.com'), false);
    assert.equal(isSuperAdminEmail(''), false);
    assert.equal(isSuperAdminEmail(null), false);
    assert.equal(isSuperAdminEmail(undefined), false);
  });

  it('matches configured ADMIN_EMAIL from env when present', () => {
    const prev = process.env.ADMIN_EMAIL;
    try {
      process.env.ADMIN_EMAIL = 'custom-admin@muqabaleh.com';
      assert.equal(isSuperAdminEmail('custom-admin@muqabaleh.com'), true);
      assert.equal(isSuperAdminEmail('CUSTOM-ADMIN@MUQABALEH.COM'), true);
    } finally {
      process.env.ADMIN_EMAIL = prev;
    }
  });
});
