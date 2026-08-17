import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addDaysAtNine,
  canSendNurture,
  nextMondayAtNine,
  shouldSkipJobClick,
  shouldSkipSignupStep,
  skipForLessOften,
  zonedParts,
} from './schedule';
import {
  normalizeCity,
  normalizeEmail,
  normalizeExperience,
  normalizeLanguage,
  normalizeName,
} from './validate';
import { nurtureHref, nurtureUtm } from './utm';
import { localeFromPreferred, timezoneForCity } from './constants';
import { readFileSync } from 'node:fs';
import { GATE1, GATE2, PREFS_COPY } from './copy';
import { renderNurtureEmail, type NurtureMerge } from './templates';

describe('nurture validation', () => {
  it('normalizes emails and rejects junk', () => {
    assert.equal(normalizeEmail('  Sam@Muqabaleh.com '), 'sam@muqabaleh.com');
    assert.equal(normalizeEmail('not-an-email'), null);
    assert.equal(normalizeName('A'), null);
    assert.equal(normalizeName('Sara Al-Mansouri'), 'Sara Al-Mansouri');
    assert.equal(normalizeCity('Dubai'), 'Dubai');
    assert.equal(normalizeCity('Paris'), null);
    assert.equal(normalizeExperience('5+'), '5+');
    assert.equal(normalizeLanguage('both'), 'BOTH');
  });
});

describe('nurture schedule', () => {
  it('maps cities to MENA timezones', () => {
    assert.equal(timezoneForCity('Riyadh'), 'Asia/Riyadh');
    assert.equal(timezoneForCity('Cairo'), 'Africa/Cairo');
    assert.equal(timezoneForCity('Amman'), 'Asia/Amman');
    assert.equal(timezoneForCity('Dubai'), 'Asia/Dubai');
  });

  it('schedules 09:00 two days later in Dubai', () => {
    const from = new Date('2026-08-17T15:00:00.000Z');
    const next = addDaysAtNine(from, 2, 'Asia/Dubai');
    const parts = zonedParts(next, 'Asia/Dubai');
    assert.equal(parts.hour, 9);
    assert.equal(parts.day, 19);
    assert.equal(parts.month, 8);
  });

  it('picks the next Monday at 09:00', () => {
    const wednesday = new Date('2026-08-19T08:00:00.000Z');
    const monday = nextMondayAtNine(wednesday, 'Asia/Dubai');
    const parts = zonedParts(monday, 'Asia/Dubai');
    assert.equal(parts.weekday, 1);
    assert.equal(parts.hour, 9);
  });

  it('skips signup steps from activity', () => {
    assert.equal(shouldSkipSignupStep(3, { lastJobsBrowseAt: new Date() }), true);
    assert.equal(shouldSkipSignupStep(3, {}), false);
    assert.equal(shouldSkipSignupStep(4, { practiceCount: 2 }), true);
    assert.equal(shouldSkipSignupStep(5, { lastJobsBrowseAt: new Date() }), true);
    assert.equal(shouldSkipJobClick({ lastJobClickAt: new Date(), lastPracticedAt: new Date() }), true);
    assert.equal(
      shouldSkipJobClick({
        lastJobClickAt: new Date('2026-08-17T10:00:00Z'),
        lastPracticedAt: new Date('2026-08-16T10:00:00Z'),
      }),
      false,
    );
  });

  it('honors preference gates', () => {
    assert.equal(canSendNurture({ frequency: 'UNSUBSCRIBED', unsubscribedAt: new Date() }).ok, false);
    assert.equal(
      canSendNurture({
        frequency: 'PAUSED',
        pausedUntil: new Date(Date.now() + 86400000),
      }).ok,
      false,
    );
    assert.equal(canSendNurture({ frequency: 'NORMAL' }).ok, true);
    assert.equal(skipForLessOften('LESS_OFTEN', 2), true);
    assert.equal(skipForLessOften('LESS_OFTEN', 3), false);
  });
});

describe('nurture utm + locale', () => {
  it('builds required UTM params', () => {
    const q = nurtureUtm({ campaign: 'new_signup_sequence', emailNumber: 1 });
    assert.match(q, /utm_source=nurture/);
    assert.match(q, /utm_medium=email/);
    assert.match(q, /utm_campaign=new_signup_sequence/);
    assert.match(q, /utm_content=email1/);
    const href = nurtureHref({
      path: '/jobs',
      locale: 'en',
      campaign: 'job_seekers',
      emailNumber: 3,
    });
    assert.match(href, /\/en\/jobs\?/);
    assert.match(href, /utm_campaign=job_seekers/);
  });

  it('routes BOTH and EN to English', () => {
    assert.equal(localeFromPreferred('AR'), 'ar');
    assert.equal(localeFromPreferred('BOTH'), 'en');
    assert.equal(localeFromPreferred('EN'), 'en');
  });
});

describe('nurture copy', () => {
  it('has real Arabic for both gates and prefs', () => {
    assert.match(GATE1.ar.headline, /جواز/);
    assert.match(GATE1.ar.cta, /افتح/);
    assert.match(GATE2.ar.badge, /تدريب/);
    assert.match(GATE2.ar.headline('مهندس', 'كريم'), /كريم/);
    assert.match(PREFS_COPY.ar.unsub, /إلغاء/);
  });
});

describe('nurture schema', () => {
  const schema = readFileSync(new URL('../../../prisma/schema.prisma', import.meta.url), 'utf8');
  it('uniques email and maps sequence_type + email_sent_at', () => {
    assert.match(schema, /model NurtureLead[\s\S]*email\s+String\s+@unique/);
    assert.match(schema, /sequence\s+String\s+@map\("sequence_type"\)/);
    assert.match(schema, /lastSentAt\s+DateTime\?\s+@map\("email_sent_at"\)/);
    assert.match(schema, /directUrl\s+=\s+env\("DIRECT_URL"\)/);
  });
});

function sampleMerge(): NurtureMerge {
  return {
    name: 'Sara',
    email: 'sara@example.com',
    city: 'Dubai',
    role: 'Software Engineer',
    company: 'Careem',
    score: 86,
    score1: 78,
    score2: 86,
    strengths: ['Clear communication', 'Ownership'],
    improvements: ['Add metrics', 'STAR structure'],
    competencies: { Communication: 88, 'Technical Depth': 80 },
    preferredLanguage: 'EN',
    token: 'tok_test',
    enrollmentId: 'enr_test',
    jobs: [
      {
        company: 'Careem',
        role: 'Staff Software Engineer',
        location: 'Dubai, UAE',
        department: 'Technology',
      },
    ],
    jobCount: 403,
  };
}

describe('nurture templates', () => {
  it('renders all signup, active, and job-seeker emails', () => {
    const merge = sampleMerge();
    const cases: Array<[string, number]> = [
      ['NEW_SIGNUP', 1],
      ['NEW_SIGNUP', 2],
      ['NEW_SIGNUP', 3],
      ['NEW_SIGNUP', 4],
      ['NEW_SIGNUP', 5],
      ['ACTIVE_PRACTICERS', 1],
      ['ACTIVE_PRACTICERS', 2],
      ['ACTIVE_PRACTICERS', 3],
      ['JOB_SEEKERS', 1],
      ['JOB_CLICK', 1],
      ['APPLY_FOLLOWUP', 1],
    ];
    for (const [sequence, step] of cases) {
      const rendered = renderNurtureEmail({ sequence, step, merge });
      assert.ok(rendered, `${sequence} ${step} missing`);
      assert.ok(rendered!.subject.length > 4);
      assert.match(rendered!.html, /utm_source=nurture/);
      assert.match(rendered!.html, /unsubscribe/);
      assert.match(rendered!.html, /\/api\/nurture\/open/);
    }
  });

  it('renders Arabic RTL when preferred language is AR', () => {
    const rendered = renderNurtureEmail({
      sequence: 'NEW_SIGNUP',
      step: 1,
      merge: { ...sampleMerge(), preferredLanguage: 'AR', name: 'سارة' },
    });
    assert.ok(rendered);
    assert.match(rendered!.html, /dir="rtl"/);
    assert.match(rendered!.subject, /جواز/);
  });
});
