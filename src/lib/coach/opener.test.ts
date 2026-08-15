import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getCachedCoachOpener,
  needsCachedOpener,
  resolveOpenerCoachName,
} from './opener';
import type { PrepSelections } from './types';

const base: PrepSelections = {
  role: 'software-engineer',
  industry: 'tech-saas',
  seniority: 'mid',
  language: 'en',
  coachGender: 'female',
};

describe('cached coach opener', () => {
  it('returns an instant English Jeannie greeting with the first question', () => {
    const text = getCachedCoachOpener(base);
    assert.match(text, /Jeannie/);
    assert.match(text, /software engineer/i);
    assert.match(text, /First question:/);
    assert.ok(text.length > 80);
  });

  it('returns an Arabic opener for mixed/ar interviews', () => {
    const text = getCachedCoachOpener({ ...base, language: 'ar', coachGender: 'female' });
    assert.match(text, /جيني/);
    assert.match(text, /مهندس برمجيات/);
    assert.match(text, /السؤال الأول/);
  });

  it('uses Jean for male coaches', () => {
    assert.equal(resolveOpenerCoachName('male', 'en'), 'Jean');
    const text = getCachedCoachOpener({ ...base, coachGender: 'male' });
    assert.match(text, /Jean/);
  });

  it('prefers the listed job title when present', () => {
    const text = getCachedCoachOpener({
      ...base,
      roleTitle: 'Real-Time Analyst (RTA)',
    });
    assert.match(text, /Real-Time Analyst \(RTA\)/);
  });

  it('only uses the cache for the empty kickoff turn', () => {
    assert.equal(needsCachedOpener([], undefined), true);
    assert.equal(needsCachedOpener([], '  '), true);
    assert.equal(needsCachedOpener([{ role: 'assistant' }], undefined), false);
    assert.equal(
      needsCachedOpener([{ role: 'assistant' }], 'I led a payments rewrite'),
      false,
    );
  });
});
