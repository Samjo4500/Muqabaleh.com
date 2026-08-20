import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  STUDENT100_CAP,
  STUDENT100_CREDITS,
  STUDENT100_DAYS,
  isCampaignOpen,
  packExpiresAt,
  remainingFromReserved,
} from './constants';
import {
  isAcademicEmail,
  isMissingRelationError,
  normalizeCountry,
  normalizeEligibility,
  normalizeEmail,
  normalizeText,
} from './eligibility';

describe('student100 campaign rules', () => {
  it('is a 100-pack of 3 credits for 30 days, already open', () => {
    assert.equal(STUDENT100_CAP, 100);
    assert.equal(STUDENT100_CREDITS, 3);
    assert.equal(STUDENT100_DAYS, 30);
    assert.equal(isCampaignOpen(new Date('2026-08-20T00:00:00+03:00')), true);
    assert.equal(isCampaignOpen(new Date('2026-08-19T20:00:00.000Z')), false);
  });

  it('tracks remaining inventory from reserved pending+activated rows', () => {
    assert.equal(remainingFromReserved(0), 100);
    assert.equal(remainingFromReserved(37), 63);
    assert.equal(remainingFromReserved(100), 0);
    assert.equal(remainingFromReserved(140), 0);
  });

  it('expires the pack 30 days after activation', () => {
    const from = new Date('2026-08-20T00:00:00.000Z');
    const end = packExpiresAt(from);
    assert.equal(end.toISOString(), '2026-09-19T00:00:00.000Z');
  });

  it('auto-verifies academic emails and rejects consumer inboxes', () => {
    assert.equal(isAcademicEmail('sara@kau.edu.sa'), true);
    assert.equal(isAcademicEmail('ali@aus.edu'), true);
    assert.equal(isAcademicEmail('n@student.ac.ae'), true);
    assert.equal(isAcademicEmail('me@gmail.com'), false);
    assert.equal(isAcademicEmail('me@outlook.com'), false);
  });

  it('requires MENA country and a real email', () => {
    assert.equal(normalizeCountry('IQ'), 'IQ');
    assert.equal(normalizeCountry('US'), null);
    assert.equal(normalizeEmail('  Sam@Muqabaleh.com '), 'sam@muqabaleh.com');
    assert.equal(normalizeEmail('nope'), null);
    assert.equal(normalizeEligibility('CURRENT_STUDENT'), 'CURRENT_STUDENT');
    assert.equal(normalizeEligibility('alumni'), null);
    assert.equal(normalizeText('  Computer Science  ', 2, 160), 'Computer Science');
  });

  it('treats a missing claims table as unavailable, not a crash', () => {
    assert.equal(
      isMissingRelationError(
        new Error('The table `public.student100_claims` does not exist in the current database.'),
      ),
      true,
    );
  });
});

describe('student100 landing client', () => {
  it('does not call next-auth useSession (marketing pages skip SessionProvider)', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/app/[locale]/student100/student100-content.tsx'),
      'utf8',
    );
    assert.doesNotMatch(src, /next-auth/);
    assert.doesNotMatch(src, /useSession/);
    assert.match(src, /\/api\/student100\/status/);
  });

  it('renders a compact MENA hero with logo, offer, and CTA', () => {
    const hero = readFileSync(
      join(process.cwd(), 'src/components/student100/Student100Hero.tsx'),
      'utf8',
    );
    const page = readFileSync(
      join(process.cwd(), 'src/app/[locale]/student100/student100-content.tsx'),
      'utf8',
    );
    assert.match(page, /<Student100Hero/);
    assert.match(page, /#s100-apply/);
    assert.match(hero, /BrandLogo/);
    assert.match(hero, /s100-hero-offer/);
    assert.match(hero, /s100-hero-cta/);
    assert.match(hero, /MENA_CAPITALS/);
  });
});
