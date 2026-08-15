import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  compactParams,
  inferSignupLocation,
  isFunnelEventName,
  isValidGaMeasurementId,
  normalizeLanguage,
  normalizePlan,
  parseFunnelEventBody,
  ratePercent,
  riyadhDayBounds,
} from './analytics-funnel';

describe('analytics-funnel', () => {
  it('rejects unknown event names', () => {
    assert.equal(isFunnelEventName('interview_started'), true);
    assert.equal(isFunnelEventName('page_view'), false);
    assert.equal(isFunnelEventName(null), false);
  });

  it('omits null, undefined, and empty params', () => {
    const compact = compactParams({
      language: 'ar',
      role: undefined,
      duration_seconds: undefined,
      guide_type: null as unknown as undefined,
      guide_slug: '',
      location: 'pricing',
      plan: undefined,
    });
    assert.deepEqual(compact, { language: 'ar', location: 'pricing' });
    assert.equal('role' in compact, false);
    assert.equal('plan' in compact, false);
    assert.equal(JSON.stringify(compact).includes('null'), false);
  });

  it('normalizes language, plan, and location', () => {
    assert.equal(normalizeLanguage('arabic'), 'ar');
    assert.equal(normalizeLanguage('EN'), 'en');
    assert.equal(normalizeLanguage('de'), undefined);
    assert.equal(normalizePlan('JEANNIE_PRO'), 'pro');
    assert.equal(normalizePlan('B2B'), 'enterprise');
    assert.equal(normalizePlan('free'), 'free');
    assert.equal(inferSignupLocation('/en/interview-guide/role/pm'), 'guide');
    assert.equal(inferSignupLocation('/app/packages'), 'pricing');
    assert.equal(inferSignupLocation('/en'), 'homepage');
  });

  it('parses a valid POST body and drops junk', () => {
    const parsed = parseFunnelEventBody({
      name: 'guide_viewed',
      language: 'en',
      guide_type: 'company',
      guide_slug: 'bybit',
      role: null,
      extra: 'ignore',
      path: '/en/interview-guide/bybit',
    });
    assert.deepEqual(parsed, {
      name: 'guide_viewed',
      language: 'en',
      guide_type: 'company',
      guide_slug: 'bybit',
      path: '/en/interview-guide/bybit',
    });
    assert.equal(parseFunnelEventBody({ name: 'not_an_event' }), null);
  });

  it('validates GA measurement IDs', () => {
    assert.equal(isValidGaMeasurementId('G-ABC123XYZ'), true);
    assert.equal(isValidGaMeasurementId('GTM-XXXX'), false);
    assert.equal(isValidGaMeasurementId('G-ABC";alert(1)'), false);
  });

  it('computes rates and Riyadh day bounds', () => {
    assert.equal(ratePercent(1, 4), 25);
    assert.equal(ratePercent(0, 0), 0);
    const today = riyadhDayBounds(0);
    const yesterday = riyadhDayBounds(-1);
    assert.equal(today.end.getTime() - today.start.getTime(), 24 * 60 * 60 * 1000);
    assert.equal(yesterday.end.getTime(), today.start.getTime());
    assert.match(today.label, /^\d{4}-\d{2}-\d{2}$/);
  });
});
