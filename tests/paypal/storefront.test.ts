/**
 * The two buttons the public pricing page actually renders must be purchasable.
 *   npx tsx --test tests/paypal/storefront.test.ts
 *
 * This file exists because an earlier version of this work gated create-order to
 * JEANNIE/JEANNIE_PRO/MASTERY_PACK, which would have 400'd PRO and UNLIMITED --
 * i.e. every checkout button on /pricing.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SELLABLE_PLANS,
  billingPeriodFor,
  expiryForPurchase,
  isSellablePlan,
  resolveLegacyPlan,
  toCents,
} from '../../src/lib/paypal/order-rules';
import { PLAN_CONFIG } from '../../src/lib/paypal';

const PRICING_PAGE_PLANS = ['PRO', 'UNLIMITED'] as const;

describe('plans the pricing page sells', () => {
  for (const plan of PRICING_PAGE_PLANS) {
    test(`${plan} is sellable`, () => {
      assert.equal(isSellablePlan(plan), true, `${plan} would 400 at create-order`);
    });

    test(`${plan} is in the catalog with a price the page matches`, () => {
      assert.ok(PLAN_CONFIG[plan], `${plan} missing from PLAN_CONFIG`);
      assert.ok(toCents(PLAN_CONFIG[plan].amount)! > 0);
    });
  }

  test('prices match the copy on the page ($9.99 and $29.99)', () => {
    assert.equal(toCents(PLAN_CONFIG.PRO.amount), 999);
    assert.equal(toCents(PLAN_CONFIG.UNLIMITED.amount), 2999);
  });

  test('every sellable plan exists in the catalog', () => {
    for (const plan of SELLABLE_PLANS) {
      assert.ok(PLAN_CONFIG[plan], `${plan} is sellable but has no catalog entry`);
    }
  });

  test('the checkout component plans are sellable too', () => {
    for (const plan of ['JEANNIE', 'JEANNIE_PRO', 'MASTERY_PACK']) {
      assert.equal(isSellablePlan(plan), true);
    }
  });

  test('booking prices are not sellable through checkout', () => {
    assert.equal(isSellablePlan('HUMAN_STD'), false);
    assert.equal(isSellablePlan('HUMAN_PRO'), false);
  });
});

describe('billing shape', () => {
  test('PRO is one-time, UNLIMITED is monthly', () => {
    assert.equal(billingPeriodFor('PRO'), 'one-time');
    assert.equal(billingPeriodFor('UNLIMITED'), 'month');
    assert.equal(billingPeriodFor('JEANNIE'), 'month');
    assert.equal(billingPeriodFor('MASTERY_PACK'), 'one-time');
  });

  test('a monthly plan sets an expiry one month out', () => {
    const now = new Date('2026-11-17T10:00:00Z');
    const end = expiryForPurchase('UNLIMITED', now, null);
    assert.ok(end);
    assert.equal(end.getTime(), new Date('2026-12-17T10:00:00Z').getTime());
  });

  test('renewing a monthly plan starts from the existing expiry (stack)', () => {
    const now = new Date('2026-11-17T10:00:00Z');
    const current = new Date('2026-12-01T00:00:00Z');
    const end = expiryForPurchase('UNLIMITED', now, current, 'stack');
    assert.equal(end!.getTime(), new Date('2027-01-01T00:00:00Z').getTime());
  });

  test('a one-time pack never touches the subscription expiry', () => {
    const now = new Date('2026-11-17T10:00:00Z');
    const current = new Date('2027-06-01T00:00:00Z');
    assert.equal(expiryForPurchase('PRO', now, current), null);
    assert.equal(expiryForPurchase('MASTERY_PACK', now, current), null);
  });

  test('a monthly plan that lapsed restarts from today, not from the old date', () => {
    const now = new Date('2026-11-17T10:00:00Z');
    const stale = new Date('2026-01-01T00:00:00Z');
    const end = expiryForPurchase('UNLIMITED', now, stale, 'stack');
    assert.equal(end!.getTime(), new Date('2026-12-17T10:00:00Z').getTime());
  });
});

describe('legacy $29.99 resolution is now unambiguous', () => {
  const catalog = { PRO: { amount: '9.99' }, UNLIMITED: { amount: '29.99' }, JEANNIE_PRO: { amount: '29.99' } };

  test('refuses when two sellable plans share a price', () => {
    assert.equal(resolveLegacyPlan('29.99', catalog), null);
  });

  test('resolves when only one plan is in scope', () => {
    assert.equal(resolveLegacyPlan('29.99', catalog, ['UNLIMITED']), 'UNLIMITED');
    assert.equal(resolveLegacyPlan('9.99', catalog), 'PRO');
  });
});

describe('database URL handling on a persistent host', () => {
  test('a PgBouncer URL gets a real pool, not connection_limit=1', async () => {
    const { resolveDatabaseUrl } = await import('../../src/lib/db');
    const out = resolveDatabaseUrl(
      'postgresql://u:p@aws-0-eu.pooler.supabase.com:6543/postgres',
    ) as string;
    const u = new URL(out);
    assert.equal(u.searchParams.get('pgbouncer'), 'true', 'transaction pooler needs this');
    assert.equal(u.searchParams.get('connection_limit'), '10', 'one shared process needs a pool');
  });

  test('a long-lived server URL is left alone', async () => {
    const { resolveDatabaseUrl } = await import('../../src/lib/db');
    const out = resolveDatabaseUrl('postgresql://muqabaleh:pw@127.0.0.1:5432/muqabaleh') as string;
    const u = new URL(out);
    assert.equal(u.searchParams.get('connection_limit'), null);
    assert.equal(u.searchParams.get('pgbouncer'), null);
    assert.equal(u.protocol, 'postgresql:', 'scheme survives URL() mangling');
  });

  test('connect_timeout is always set so health checks fail fast', async () => {
    const { resolveDatabaseUrl } = await import('../../src/lib/db');
    const out = resolveDatabaseUrl('postgresql://u:p@127.0.0.1:5432/db') as string;
    assert.equal(new URL(out).searchParams.get('connect_timeout'), '10');
  });
});
