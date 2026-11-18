/**
 * End-to-end capture flow: real Postgres, fake PayPal at the fetch boundary.
 *   npx tsx --test tests/paypal/capture-flow.test.ts
 *
 * Asserts on the thing that was costing money — refunds issued and payments
 * written — for every retry sequence a real buyer can produce.
 */
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { boot, seedUser, seedOrder, getDb, getFake } from './pg-harness';
import { setPayPalDb } from '../../src/lib/paypal/seams';
import { captureFlow, __setCaptureDb } from '../../src/lib/paypal/capture-flow';
import type { FakePayPal } from './pg-harness';

let raw: PGlite;
let fake: FakePayPal;

beforeEach(async () => {
  ({ raw } = await boot());
  fake = getFake() as FakePayPal;
  const testDb = getDb();
  setPayPalDb(testDb);
  await seedUser(raw, 'user_1');
  await seedUser(raw, 'user_2');
});

afterEach(async () => {
  await raw.close();
});

const payments = async () =>
  Number((await raw.query('SELECT count(*)::int AS n FROM "Payment"')).rows[0].n);
const orderRow = async () => (await raw.query('SELECT * FROM "PaypalOrder"')).rows[0] as any;
const userRow = async () => (await raw.query('SELECT * FROM "User" WHERE id = $1', ['user_1'])).rows[0] as any;

/** Create the PayPal-side order the fake will serve. */
function arrangement(over: { amount?: string; merchant?: string } = {}) {
  const id = 'PPO-TEST-1';
  fake.orders.set(id, {
    id,
    status: 'APPROVED',
    amount: { currency_code: 'USD', value: over.amount ?? '14.99' },
    merchantId: over.merchant ?? 'MERCHANT_TEST',
    capture: null,
    captureAttempts: 0,
  });
  return id;
}

describe('the refund bug, end to end', () => {
  test('pay -> refresh -> refresh: one payment, one grant, ZERO refunds', async () => {
    const id = arrangement();
    await seedOrder(raw, { paypalOrderId: id });

    const first = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal(first.http, 200);
    assert.equal((first.body as any).alreadyGranted, false);

    const second = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal(second.http, 200, 'a refresh must never be an error');
    assert.equal((second.body as any).alreadyGranted, true);

    const third = await captureFlow({ paypalOrderId: id }, { userId: 'user_1', ref: 'mo_test' });
    assert.equal(third.http, 200);

    assert.equal(await payments(), 1);
    assert.equal(fake.refunds.length, 0, 'nobody was refunded');
    assert.equal(fake.orders.get(id)!.captureAttempts, 1, 'PayPal capture called once');
    const u = await userRow();
    assert.equal(u.tier, 'JEANNIE');
    assert.equal(u.sessionsLeft, 999);
  });

  test('webhook settles first, then the browser returns: no refund, no double grant', async () => {
    const id = arrangement();
    await seedOrder(raw, { paypalOrderId: id });

    // Simulate the webhook having already captured + granted (as it does).
    fake.orders.get(id)!.capture = {
      id: 'CAP-WEBHOOK',
      status: 'COMPLETED',
      value: '14.99',
      currency: 'USD',
    };
    fake.orders.get(id)!.status = 'COMPLETED';
    const { grantForCapture } = await import('../../src/lib/paypal/grant');
    await grantForCapture(
      'mo_test',
      {
        paypalOrderId: id,
        captureId: 'CAP-WEBHOOK',
        captureStatus: 'COMPLETED',
        amountCents: 1499,
        currency: 'USD',
        merchantId: 'MERCHANT_TEST',
        payerId: 'P1',
      },
      { db: getDb() },
    );

    // Now the buyer's tab comes back and calls capture again.
    const res = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal(res.http, 200);
    assert.equal((res.body as any).alreadyGranted, true);
    assert.equal(await payments(), 1);
    assert.equal(fake.refunds.length, 0);
    assert.equal(fake.orders.get(id)!.captureAttempts, 0, 'no second capture attempted');
  });

  test('another account cannot capture or trigger a refund', async () => {
    const id = arrangement();
    await seedOrder(raw, { paypalOrderId: id });
    const res = await captureFlow({ paypalOrderId: id }, { userId: 'user_2' });
    assert.equal(res.http, 403);
    assert.equal(await payments(), 0);
    assert.equal(fake.refunds.length, 0);
  });

  test('buyer never approved: 409, no capture, no refund', async () => {
    const id = arrangement();
    fake.orders.get(id)!.status = 'CREATED';
    await seedOrder(raw, { paypalOrderId: id, status: 'CREATED' });

    const res = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal(res.http, 409);
    assert.equal(fake.orders.get(id)!.captureAttempts, 0);
    assert.equal(fake.refunds.length, 0);
    assert.equal(await payments(), 0);
  });
});

describe('mismatches are refunded once, and recorded', () => {
  test('underpaid: refunded, order flagged REVIEW, no grant', async () => {
    const id = arrangement();
    await seedOrder(raw, { paypalOrderId: id });
    fake.overrideAmount = { value: '1.00', currency: 'USD' };

    const res = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal(res.http, 400);
    assert.equal((res.body as any).reason, 'amount_mismatch');
    assert.equal((res.body as any).refunded, true);
    assert.equal(fake.refunds.length, 1, 'exactly one refund');
    assert.match(fake.refunds[0].note, /amount_mismatch/);
    assert.equal(await payments(), 0);
    const o = await orderRow();
    assert.equal(o.status, 'REVIEW');
    assert.equal(o.failureCode, 'amount_mismatch');
    assert.equal((await userRow()).tier, 'FREE');
  });

  test('a retry after a refund does not refund twice', async () => {
    const id = arrangement();
    await seedOrder(raw, { paypalOrderId: id });
    fake.overrideAmount = { value: '1.00', currency: 'USD' };

    await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    const again = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal(again.http, 400);
    assert.equal(fake.refunds.length, 1, 'already-refunded capture is not refunded again');
    assert.equal(await payments(), 0);
  });

  test('paid to the wrong merchant: refunded, not granted', async () => {
    const id = arrangement({ merchant: 'NOT_US' });
    await seedOrder(raw, { paypalOrderId: id });
    const res = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal((res.body as any).reason, 'merchant_mismatch');
    assert.equal(fake.refunds.length, 1);
    assert.equal(await payments(), 0);
  });
});

describe('e-cheque (PENDING)', () => {
  test('PENDING returns 202, grants nothing, and grants later on settlement', async () => {
    const id = arrangement();
    await seedOrder(raw, { paypalOrderId: id });
    fake.captureStatus = 'PENDING';

    const res = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal(res.http, 202);
    assert.equal(await payments(), 0);
    assert.equal(fake.refunds.length, 0, 'a pending payment is never refunded');
    assert.equal((await orderRow()).status, 'APPROVED');

    // PayPal settles it; the webhook path captures from COMPLETED.
    const { grantForCapture } = await import('../../src/lib/paypal/grant');
    const settled = await grantForCapture(
      'mo_test',
      {
        paypalOrderId: id,
        captureId: 'CAP-1',
        captureStatus: 'COMPLETED',
        amountCents: 1499,
        currency: 'USD',
        merchantId: 'MERCHANT_TEST',
        payerId: 'P1',
      },
      { db: getDb() },
    );
    assert.equal(settled.status, 'granted');
    assert.equal(await payments(), 1);
  });
});

describe('PayPal-side races', () => {
  test('ORDER_ALREADY_CAPTURED is resolved by re-reading, not by refunding', async () => {
    const id = arrangement();
    await seedOrder(raw, { paypalOrderId: id });
    // Someone captured it between our preflight and our capture call.
    fake.orders.get(id)!.capture = { id: 'CAP-OTHER', status: 'COMPLETED', value: '14.99', currency: 'USD' };
    fake.orders.get(id)!.status = 'COMPLETED';

    const res = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal(res.http, 200);
    assert.equal(await payments(), 1);
    assert.equal(fake.refunds.length, 0);
  });

  test('a capture that PayPal declines grants nothing', async () => {
    const id = arrangement();
    await seedOrder(raw, { paypalOrderId: id });
    fake.captureStatus = 'DECLINED';
    const res = await captureFlow({ paypalOrderId: id }, { userId: 'user_1' });
    assert.equal(res.http, 202);
    assert.equal(await payments(), 0);
    assert.equal(fake.refunds.length, 0);
  });
});
