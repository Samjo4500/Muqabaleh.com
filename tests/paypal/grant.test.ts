/**
 * Money-path tests against real Postgres (PGlite) using the repo's real schema.
 *   npx tsx --test tests/paypal/grant.test.ts
 *
 * These are the ones that matter: unique constraints, P2002 recovery and
 * transaction rollback are all genuine, not mocked.
 */
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { boot, seedUser, seedOrder, facts } from './pg-harness';
import { grantForCapture } from '../../src/lib/paypal/grant';
import type { GrantDb } from '../../src/lib/paypal/grant';

let raw: PGlite;
let db: GrantDb;

beforeEach(async () => {
  ({ raw, db } = await boot());
  await seedUser(raw, 'user_1');
  await seedUser(raw, 'user_2');
});

afterEach(async () => {
  await raw.close();
});

const countPayments = async () =>
  Number((await raw.query('SELECT count(*)::int AS n FROM "Payment"')).rows[0].n);

const orderRow = async (ref = 'mo_test') =>
  (await raw.query('SELECT * FROM "PaypalOrder" WHERE ref = $1', [ref])).rows[0] as any;

const user = async (id = 'user_1') =>
  (await raw.query('SELECT * FROM "User" WHERE id = $1', [id])).rows[0] as any;

describe('the bug that refunded paying customers', () => {
  test('first capture grants; second returns already_granted and creates no second payment', async () => {
    await seedOrder(raw);

    const first = await grantForCapture('mo_test', facts(), { db, userId: 'user_1' });
    assert.equal(first.status, 'granted');
    assert.equal(await countPayments(), 1);

    const second = await grantForCapture('mo_test', facts(), { db, userId: 'user_1' });
    assert.equal(second.status, 'already_granted', 'a replay is success, not a failure');
    assert.equal(await countPayments(), 1, 'no second ledger row');

    // and the entitlement was not credited twice
    const u = await user();
    assert.equal(u.tier, 'JEANNIE');
    assert.equal(u.sessionsLeft, 999, 'grantPlan ran once, not twice');
  });

  test('four attempts (pay, refresh, webhook retry, second tab) = one payment', async () => {
    await seedOrder(raw);
    const results = [];
    for (let i = 0; i < 4; i++) {
      results.push((await grantForCapture('mo_test', facts(), { db, userId: 'user_1' })).status);
    }
    assert.deepEqual(results, ['granted', 'already_granted', 'already_granted', 'already_granted']);
    assert.equal(await countPayments(), 1);
  });

  test('already_granted is returned even if facts now look wrong', async () => {
    await seedOrder(raw);
    await grantForCapture('mo_test', facts(), { db, userId: 'user_1' });
    const replay = await grantForCapture('mo_test', facts({ amountCents: 1 }), { db, userId: 'user_1' });
    assert.equal(replay.status, 'already_granted');
  });

  test('concurrent duplicates lose on the unique index, not on a refund', async () => {
    await seedOrder(raw);
    const [a, b] = await Promise.all([
      grantForCapture('mo_test', facts(), { db, userId: 'user_1' }),
      grantForCapture('mo_test', facts(), { db, userId: 'user_1' }),
    ]);
    const statuses = [a.status, b.status].sort();
    assert.deepEqual(statuses, ['already_granted', 'granted']);
    assert.equal(await countPayments(), 1);
  });
});

describe('validation is enforced against the order, not the payload', () => {
  test('wrong amount: rejected, order moved to REVIEW, no payment', async () => {
    await seedOrder(raw);
    const r = await grantForCapture('mo_test', facts({ amountCents: 100 }), { db, userId: 'user_1' });
    assert.equal(r.status, 'rejected');
    assert.equal(r.status === 'rejected' && r.reason, 'amount_mismatch');
    assert.equal(await countPayments(), 0);
    assert.equal((await orderRow()).status, 'REVIEW');
    assert.equal((await orderRow()).failureCode, 'amount_mismatch');
  });

  test('wrong merchant: rejected', async () => {
    await seedOrder(raw);
    const r = await grantForCapture('mo_test', facts({ merchantId: 'SOMEONE_ELSE' }), {
      db,
      userId: 'user_1',
    });
    assert.equal(r.status === 'rejected' && r.reason, 'merchant_mismatch');
    assert.equal(await countPayments(), 0);
  });

  test("another user's order: rejected, nothing granted to either account", async () => {
    await seedOrder(raw);
    const r = await grantForCapture('mo_test', facts(), { db, userId: 'user_2' });
    assert.equal(r.status === 'rejected' && r.reason, 'order_not_owned');
    assert.equal(await countPayments(), 0);
    assert.equal((await user('user_2')).tier, 'FREE');
    assert.equal((await user('user_1')).tier, 'FREE');
  });

  test('server-internal caller (webhook) skips the ownership check', async () => {
    await seedOrder(raw);
    const r = await grantForCapture('mo_test', facts(), { db });
    assert.equal(r.status, 'granted');
  });

  test('PENDING capture grants nothing and stays recoverable', async () => {
    await seedOrder(raw);
    const pending = await grantForCapture('mo_test', facts({ captureStatus: 'PENDING' }), {
      db,
      userId: 'user_1',
    });
    assert.equal(pending.status === 'rejected' && pending.reason, 'not_completed');
    assert.equal(await countPayments(), 0);

    // PayPal later settles it; the webhook calls again with COMPLETED.
    const settled = await grantForCapture('mo_test', facts(), { db });
    assert.equal(settled.status, 'granted');
    assert.equal(await countPayments(), 1);
  });

  test('legacy SKU on a new order is refused', async () => {
    await seedOrder(raw, { planCode: 'UNLIMITED', amountCents: 2999 });
    const r = await grantForCapture('mo_test', facts({ amountCents: 2999 }), { db, userId: 'user_1' });
    assert.equal(r.status === 'rejected' && r.reason, 'plan_not_sellable');
    assert.equal(await countPayments(), 0);
  });
});

/** Wraps the adapter so one write inside the transaction throws. */
function failingTx(which: 'user' | 'paypalOrder'): GrantDb {
  return {
    ...db,
    $transaction: async <T>(fn: (tx: GrantDb) => Promise<T>) =>
      db.$transaction(async (tx) => {
        const boom = async () => {
          throw new Error(`${which} write failed`);
        };
        const patched =
          which === 'user'
            ? { ...tx, user: { ...tx.user, update: boom } }
            : { ...tx, paypalOrder: { ...tx.paypalOrder, update: boom } };
        return fn(patched as GrantDb);
      }),
  };
}

describe('atomicity: all or nothing', () => {
  test('if the entitlement write fails, the payment row is rolled back', async () => {
    await seedOrder(raw);
    await assert.rejects(
      () => grantForCapture('mo_test', facts(), { db: failingTx('user'), userId: 'user_1' }),
      /user write failed/,
    );
    assert.equal(await countPayments(), 0, 'no orphaned payment row');
    assert.equal((await orderRow()).grantedAt, null, 'order not marked as granted');
  });

  test('if the order-state write fails, no payment and no entitlement survive', async () => {
    await seedOrder(raw);
    await assert.rejects(
      () => grantForCapture('mo_test', facts(), { db: failingTx('paypalOrder'), userId: 'user_1' }),
      /paypalOrder write failed/,
    );
    assert.equal(await countPayments(), 0);
    const u = await user();
    assert.equal(u.tier, 'FREE', 'entitlement not granted');
    assert.equal(u.sessionsLeft, 1, 'sessions untouched');
  });

  test('a failure leaves the order re-capturable rather than half-granted', async () => {
    await seedOrder(raw);
    await assert.rejects(() =>
      grantForCapture('mo_test', facts(), { db: failingTx('user'), userId: 'user_1' }),
    );
    // The next attempt on the same order (e.g. PayPal retry) still works.
    const retry = await grantForCapture('mo_test', facts(), { db, userId: 'user_1' });
    assert.equal(retry.status, 'granted');
  });
});

describe('ledger', () => {
  test('records the amount, plan and PayPal ids', async () => {
    await seedOrder(raw, { amountCents: 4499, planCode: 'MASTERY_PACK' });
    await grantForCapture('mo_test', facts({ amountCents: 4499 }), { db, userId: 'user_1' });
    const p = (await raw.query('SELECT * FROM "Payment"')).rows[0] as any;
    assert.equal(Number(p.amount), 44.99);
    assert.equal(p.packageType, 'MASTERY_PACK');
    assert.equal(p.paypalOrderId, 'PPO-1');
    assert.equal(p.idempotencyKey, 'user_1-PPO-1');
    assert.equal(p.status, 'COMPLETED');
  });
});
