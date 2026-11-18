/**
 * Reconciliation sweep: settles abandoned and webhook-less checkouts.
 *   npx tsx --test tests/paypal/reconcile.test.ts
 */
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { boot, seedUser, seedOrder, getDb, getFake } from './pg-harness';
import type { FakePayPal } from './pg-harness';
import { setPayPalDb } from '../../src/lib/paypal/seams';
import { reconcilePayPalOrders } from '../../src/lib/paypal/reconcile';

let raw: PGlite;
let fake: FakePayPal;

beforeEach(async () => {
  ({ raw } = await boot());
  fake = getFake() as FakePayPal;
  setPayPalDb(getDb());
  await seedUser(raw, 'user_1');
});

afterEach(async () => {
  await raw.close();
});

const payments = async () =>
  Number((await raw.query('SELECT count(*)::int AS n FROM "Payment"')).rows[0].n);
const orderRow = async () => (await raw.query('SELECT * FROM "PaypalOrder"')).rows[0] as any;
const userRow = async () => (await raw.query('SELECT * FROM "User" WHERE id = $1', ['user_1'])).rows[0] as any;

/** Make the order look a day old so the sweep (default cutoff: 3 hours) picks it up. */
async function ageOrder() {
  await raw.query(`UPDATE "PaypalOrder" SET "createdAt" = now() - interval '24 hours'`);
}

function paypalOrder(id: string, status: any, capture: any = null) {
  fake.orders.set(id, {
    id,
    status,
    amount: { currency_code: 'USD', value: '14.99' },
    merchantId: 'MERCHANT_TEST',
    capture,
    captureAttempts: 0,
  });
}

describe('reconciliation', () => {
  test('orders younger than the cutoff are left alone', async () => {
    paypalOrder('PPO-1', 'APPROVED');
    await seedOrder(raw, { paypalOrderId: 'PPO-1', status: 'APPROVED' });
    await raw.query(`UPDATE "PaypalOrder" SET "createdAt" = now() - interval '20 minutes'`);

    const report = await reconcilePayPalOrders();
    assert.equal(report.looked, 0, 'a 20-minute-old intent is still in-flight');
    assert.equal(await payments(), 0);
  });

  test('fresh orders are left alone', async () => {
    paypalOrder('PPO-1', 'APPROVED');
    await seedOrder(raw, { paypalOrderId: 'PPO-1', status: 'APPROVED' });

    const report = await reconcilePayPalOrders();
    assert.equal(report.looked, 0, 'a just-created intent is not the sweep\'s business');
    assert.equal(await payments(), 0);
  });

  test('buyer approved, closed the tab, webhook never came: granted', async () => {
    paypalOrder('PPO-1', 'APPROVED');
    await seedOrder(raw, { paypalOrderId: 'PPO-1', status: 'APPROVED' });
    await ageOrder();

    const report = await reconcilePayPalOrders();
    assert.equal(report.granted, 1);
    assert.equal(await payments(), 1);
    assert.equal((await userRow()).tier, 'JEANNIE');
    assert.equal((await orderRow()).status, 'COMPLETED');
  });

  test('sweep racing a returning browser still grants once', async () => {
    paypalOrder('PPO-1', 'APPROVED');
    await seedOrder(raw, { paypalOrderId: 'PPO-1', status: 'APPROVED' });
    await ageOrder();

    const { captureFlow } = await import('../../src/lib/paypal/capture-flow');
    const [sweep] = await Promise.all([
      reconcilePayPalOrders(),
      captureFlow({ paypalOrderId: 'PPO-1' }, { userId: 'user_1' }),
    ]);
    assert.ok(sweep.granted <= 1);
    assert.equal(await payments(), 1, 'exactly one payment');
    assert.equal(fake.refunds.length, 0, 'and no refund');
  });

  test('already captured at PayPal but never recorded: granted from PayPal state', async () => {
    paypalOrder('PPO-1', 'COMPLETED', {
      id: 'CAP-1',
      status: 'COMPLETED',
      value: '14.99',
      currency: 'USD',
    });
    await seedOrder(raw, { paypalOrderId: 'PPO-1', status: 'APPROVED' });
    await ageOrder();

    const report = await reconcilePayPalOrders();
    assert.equal(report.granted, 1);
    assert.equal(await payments(), 1);
  });

  test('abandoned cart is closed, not granted', async () => {
    paypalOrder('PPO-1', 'CREATED');
    await seedOrder(raw, { paypalOrderId: 'PPO-1', status: 'CREATED' });
    await ageOrder();

    const report = await reconcilePayPalOrders();
    assert.equal(report.closed, 1);
    assert.equal(report.granted, 0);
    assert.equal(await payments(), 0);
    const o = await orderRow();
    assert.equal(o.status, 'VOIDED');
    assert.equal(o.failureCode, 'ABANDONED_UNPAID');
  });

  test('an intent that never reached PayPal is closed', async () => {
    await seedOrder(raw, { paypalOrderId: null, status: 'CREATED' });
    await ageOrder();

    const report = await reconcilePayPalOrders();
    assert.equal(report.closed, 1);
    assert.equal((await orderRow()).status, 'VOIDED');
  });

  test('an order PayPal has forgotten is closed', async () => {
    await seedOrder(raw, { paypalOrderId: 'PPO-GONE', status: 'APPROVED' });
    await ageOrder();

    const report = await reconcilePayPalOrders();
    assert.equal(report.closed, 1);
    assert.equal((await orderRow()).failureCode, 'EXPIRED_AT_PAYPAL');
  });

  test('dry run writes nothing', async () => {
    paypalOrder('PPO-1', 'APPROVED');
    await seedOrder(raw, { paypalOrderId: 'PPO-1', status: 'APPROVED' });
    await ageOrder();

    const report = await reconcilePayPalOrders({ dryRun: true });
    assert.equal(report.looked, 1);
    assert.equal(await payments(), 0);
    assert.equal((await orderRow()).status, 'APPROVED');
    assert.equal(fake.orders.get('PPO-1')!.captureAttempts, 0, 'no capture attempted');
  });

  test('a run that fails on one order does not abort the rest', async () => {
    paypalOrder('PPO-OK', 'APPROVED');
    paypalOrder('PPO-BAD', 'APPROVED');
    await seedOrder(raw, { ref: 'mo_ok', paypalOrderId: 'PPO-OK', status: 'APPROVED' });
    await seedOrder(raw, { ref: 'mo_bad', paypalOrderId: 'PPO-BAD', status: 'APPROVED' });
    await ageOrder();

    // Make PayPal blow up for one of them.
    const original = fake.handler;
    fake.handler = async (url: string, init?: RequestInit) => {
      if (url.includes('PPO-BAD')) throw new Error('network down');
      return original(url, init);
    };

    const report = await reconcilePayPalOrders();
    assert.ok(report.granted >= 1, 'the healthy order still settled');
    assert.ok(report.failed.length >= 1, 'the broken one was reported, not fatal');
  });
});
