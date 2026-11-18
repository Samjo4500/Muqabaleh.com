/**
 * Webhook: dedupe, recovery of an abandoned checkout, refund flagging.
 *   npx tsx --test tests/paypal/webhook.test.ts
 */
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { boot, seedUser, seedOrder, getDb, getFake } from './pg-harness';
import type { FakePayPal } from './pg-harness';
import { handleWebhook } from '../../src/lib/paypal/webhook';
import { setPayPalDb } from '../../src/lib/paypal/seams';

let raw: PGlite;
let fake: FakePayPal;

beforeEach(async () => {
  process.env.PAYPAL_WEBHOOK_ID = 'WH-TEST';
  ({ raw } = await boot());
  fake = getFake() as FakePayPal;
  setPayPalDb(getDb());
  await seedUser(raw, 'user_1');
});

afterEach(async () => {
  await raw.close();
});

const headers = () =>
  new Headers({
    'paypal-transmission-id': 'tid',
    'paypal-transmission-time': '2026-11-17T00:00:00Z',
    'paypal-cert-url': 'https://api.paypal.com/cert',
    'paypal-auth-algo': 'SHA256withRSA',
    'paypal-transmission-sig': 'sig',
  });

const payments = async () =>
  Number((await raw.query('SELECT count(*)::int AS n FROM "Payment"')).rows[0].n);
const order = async () => (await raw.query('SELECT * FROM "PaypalOrder"')).rows[0] as any;

/** The fake PayPal also answers /v1/notifications/verify-webhook-signature. */
function verified() {
  const handler = fake.handler;
  fake.handler = async (url: string, init?: RequestInit) => {
    if (url.includes('verify-webhook-signature')) {
      return new Response(JSON.stringify({ verification_status: 'SUCCESS' }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    return handler(url, init);
  };
}

function captureCompleted(eventId: string, paypalOrderId: string) {
  return JSON.stringify({
    id: eventId,
    event_type: 'PAYMENT.CAPTURE.COMPLETED',
    resource: {
      id: 'CAP-WH-1',
      status: 'COMPLETED',
      amount: { value: '14.99', currency_code: 'USD' },
      supplementary_data: { related_ids: { order_id: paypalOrderId } },
    },
  });
}

describe('recovering a checkout the browser abandoned', () => {
  test('webhook alone grants when the buyer closed the tab', async () => {
    verified();
    const id = 'PPO-WH-1';
    fake.orders.set(id, {
      id,
      status: 'COMPLETED',
      amount: { currency_code: 'USD', value: '14.99' },
      merchantId: 'MERCHANT_TEST',
      capture: { id: 'CAP-WH-1', status: 'COMPLETED', value: '14.99', currency: 'USD' },
      captureAttempts: 0,
    });
    await seedOrder(raw, { paypalOrderId: id });

    const res = await handleWebhook(captureCompleted('EV-1', id), headers());
    assert.equal(res.status, 200);
    assert.equal(res.body.result, 'granted');
    assert.equal(await payments(), 1);
    assert.equal((await order()).status, 'COMPLETED');
  });

  test('PayPal retrying the same event grants once', async () => {
    verified();
    const id = 'PPO-WH-2';
    fake.orders.set(id, {
      id,
      status: 'COMPLETED',
      amount: { currency_code: 'USD', value: '14.99' },
      merchantId: 'MERCHANT_TEST',
      capture: { id: 'CAP-WH-2', status: 'COMPLETED', value: '14.99', currency: 'USD' },
      captureAttempts: 0,
    });
    await seedOrder(raw, { paypalOrderId: id });

    const first = await handleWebhook(captureCompleted('EV-2', id), headers());
    const second = await handleWebhook(captureCompleted('EV-2', id), headers());

    assert.equal(first.body.result, 'granted');
    assert.equal(second.body.duplicate, true);
    assert.equal(await payments(), 1);
  });

  test('a different event id for the same capture does not double-grant', async () => {
    verified();
    const id = 'PPO-WH-3';
    fake.orders.set(id, {
      id,
      status: 'COMPLETED',
      amount: { currency_code: 'USD', value: '14.99' },
      merchantId: 'MERCHANT_TEST',
      capture: { id: 'CAP-WH-3', status: 'COMPLETED', value: '14.99', currency: 'USD' },
      captureAttempts: 0,
    });
    await seedOrder(raw, { paypalOrderId: id });

    await handleWebhook(captureCompleted('EV-3a', id), headers());
    const second = await handleWebhook(captureCompleted('EV-3b', id), headers());
    assert.equal(second.body.result, 'already_granted');
    assert.equal(await payments(), 1);
  });

  test('payload is not trusted: webhook amount is ignored in favour of PayPal state', async () => {
    verified();
    const id = 'PPO-WH-4';
    fake.orders.set(id, {
      id,
      status: 'COMPLETED',
      amount: { currency_code: 'USD', value: '14.99' },
      merchantId: 'MERCHANT_TEST',
      capture: { id: 'CAP-WH-4', status: 'COMPLETED', value: '14.99', currency: 'USD' },
      captureAttempts: 0,
    });
    await seedOrder(raw, { paypalOrderId: id });

    const body = JSON.stringify({
      id: 'EV-4',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      resource: {
        id: 'CAP-WH-4',
        amount: { value: '0.01', currency_code: 'USD' }, // lie
        supplementary_data: { related_ids: { order_id: id } },
      },
    });
    const res = await handleWebhook(body, headers());
    assert.equal(res.body.result, 'granted', 'PayPal says 14.99, so it grants');
    assert.equal(await payments(), 1);
  });
});

describe('refunds and denials are flagged, not auto-revoked', () => {
  test('a refund event marks REVIEW and keeps the entitlement', async () => {
    verified();
    const id = 'PPO-WH-5';
    fake.orders.set(id, {
      id,
      status: 'COMPLETED',
      amount: { currency_code: 'USD', value: '14.99' },
      merchantId: 'MERCHANT_TEST',
      capture: { id: 'CAP-WH-5', status: 'COMPLETED', value: '14.99', currency: 'USD' },
      captureAttempts: 0,
    });
    await seedOrder(raw, { paypalOrderId: id });
    await handleWebhook(captureCompleted('EV-5a', id), headers());

    const refund = JSON.stringify({
      id: 'EV-5b',
      event_type: 'PAYMENT.CAPTURE.REFUNDED',
      resource: {
        id: 'REF-1',
        supplementary_data: { related_ids: { order_id: id } },
      },
    });
    const res = await handleWebhook(refund, headers());
    assert.equal(res.body.refunded, true);

    const o = await order();
    assert.equal(o.status, 'REVIEW');
    assert.equal(o.failureCode, 'REFUNDED');
    const u = (await raw.query('SELECT * FROM "User" WHERE id = $1', ['user_1'])).rows[0] as any;
    assert.equal(u.tier, 'JEANNIE', 'entitlement left for a human to decide');
  });

  test('a denied capture grants nothing', async () => {
    verified();
    const id = 'PPO-WH-6';
    await seedOrder(raw, { paypalOrderId: id });
    const denied = JSON.stringify({
      id: 'EV-6',
      event_type: 'PAYMENT.CAPTURE.DENIED',
      resource: { id: 'CAP-6', supplementary_data: { related_ids: { order_id: id } } },
    });
    const res = await handleWebhook(denied, headers());
    assert.equal(res.body.denied, true);
    assert.equal(await payments(), 0);
    assert.equal((await order()).status, 'FAILED');
  });
});

describe('signature verification still fails closed', () => {
  test('no headers: 401, nothing processed', async () => {
    const id = 'PPO-WH-7';
    await seedOrder(raw, { paypalOrderId: id });
    const res = await handleWebhook(captureCompleted('EV-7', id), new Headers());
    assert.equal(res.status, 401);
    assert.equal(await payments(), 0);
  });

  test('PayPal says the signature is bad: 401', async () => {
    const original = fake.handler;
    fake.handler = async (url: string, init?: RequestInit) => {
      if (url.includes('verify-webhook-signature')) {
        return new Response(JSON.stringify({ verification_status: 'FAILURE' }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return original(url, init);
    };
    const id = 'PPO-WH-8';
    await seedOrder(raw, { paypalOrderId: id });
    const res = await handleWebhook(captureCompleted('EV-8', id), headers());
    assert.equal(res.status, 401);
    assert.equal(await payments(), 0);
  });
});
