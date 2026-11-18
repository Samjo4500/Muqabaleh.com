/**
 * Pure logic tests. No DB, no network.
 *   npx tsx --test tests/paypal/order-rules.test.ts
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  decideActivation,
  decideCapture,
  isSellablePlan,
  liveModeAllowed,
  resolveLegacyPlan,
  toCents,
  type CaptureFacts,
  type OrderSnapshot,
} from '../../src/lib/paypal/order-rules';

// The real catalog amounts, copied from src/lib/paypal.ts PLAN_CONFIG.
const CATALOG = {
  JEANNIE: { amount: '14.99' },
  JEANNIE_PRO: { amount: '29.99' },
  MASTERY_PACK: { amount: '44.99' },
  PRO: { amount: '9.99' },
  UNLIMITED: { amount: '29.99' },
};

const order = (over: Partial<OrderSnapshot> = {}): OrderSnapshot => ({
  ref: 'mo_1',
  userId: 'user_1',
  planCode: 'JEANNIE',
  amountCents: 1499,
  currency: 'USD',
  status: 'APPROVED',
  grantedAt: null,
  paypalOrderId: 'PPO-1',
  ...over,
});

const facts = (over: Partial<CaptureFacts> = {}): CaptureFacts => ({
  paypalOrderId: 'PPO-1',
  captureId: 'CAP-1',
  captureStatus: 'COMPLETED',
  amountCents: 1499,
  currency: 'USD',
  merchantId: 'M1',
  payerId: 'PAYER1',
  ...over,
});

describe('the refund bug: replaying a capture', () => {
  test('a second capture call is already_granted, never a rejection', () => {
    // BEFORE: this threw P2002 -> catch -> refundPayPalCapture -> 500.
    const d = decideCapture(order({ grantedAt: new Date() }), facts(), { userId: 'user_1' });
    assert.equal(d.action, 'already_granted');
  });

  test('idempotency is checked before money, so a replay can never refund', () => {
    const d = decideCapture(order({ grantedAt: new Date() }), facts({ amountCents: 1 }), {
      userId: 'user_1',
    });
    assert.equal(d.action, 'already_granted');
  });

  test('capture -> refresh -> webhook retry -> second tab = one grant, zero refunds', () => {
    let grantedAt: Date | null = null;
    let grants = 0;
    let refunds = 0;

    const attempt = () => {
      const d = decideCapture(order({ grantedAt }), facts(), {
        userId: 'user_1',
        expectedMerchantId: 'M1',
      });
      if (d.action === 'grant') {
        grants += 1;
        grantedAt = new Date();
      } else if (d.action === 'reject') {
        refunds += 1; // the caller refunds on rejection
      }
      return d.action;
    };

    assert.equal(attempt(), 'grant');
    assert.equal(attempt(), 'already_granted');
    assert.equal(attempt(), 'already_granted');
    assert.equal(attempt(), 'already_granted');
    assert.equal(grants, 1);
    assert.equal(refunds, 0);
  });
});

describe('money and identity', () => {
  test('happy path grants', () => {
    assert.deepEqual(
      decideCapture(order(), facts(), { userId: 'user_1', expectedMerchantId: 'M1' }),
      { action: 'grant' },
    );
  });

  test('another user cannot capture the order', () => {
    const d = decideCapture(order(), facts(), { userId: 'user_2' });
    assert.equal(d.action, 'reject');
    assert.equal((d as { reason: string }).reason, 'order_not_owned');
  });

  test('underpaid and overpaid are both refused', () => {
    assert.equal((decideCapture(order(), facts({ amountCents: 100 })) as any).reason, 'amount_mismatch');
    assert.equal((decideCapture(order(), facts({ amountCents: 2999 })) as any).reason, 'amount_mismatch');
  });

  test('a one-cent difference is still refused', () => {
    assert.equal((decideCapture(order(), facts({ amountCents: 1498 })) as any).reason, 'amount_mismatch');
  });

  test('wrong currency refused', () => {
    assert.equal((decideCapture(order(), facts({ currency: 'EUR' })) as any).reason, 'currency_mismatch');
  });

  test('money paid to another merchant refused', () => {
    const d = decideCapture(order(), facts({ merchantId: 'OTHER' }), {
      userId: 'user_1',
      expectedMerchantId: 'M1',
    });
    assert.equal((d as any).reason, 'merchant_mismatch');
  });

  test('a capture from a different PayPal order is not this order', () => {
    const d = decideCapture(order(), facts({ paypalOrderId: 'PPO-2' }), { userId: 'user_1' });
    assert.equal((d as any).reason, 'order_mismatch');
  });

  test('PENDING (e-cheque) grants nothing until it settles', () => {
    assert.equal((decideCapture(order(), facts({ captureStatus: 'PENDING' })) as any).reason, 'not_completed');
  });

  test('DECLINED grants nothing', () => {
    assert.equal((decideCapture(order(), facts({ captureStatus: 'DECLINED' })) as any).reason, 'not_completed');
  });

  test('voided order grants nothing', () => {
    assert.equal((decideCapture(order({ status: 'VOIDED' }), facts()) as any).reason, 'order_voided');
  });

  test('missing order grants nothing', () => {
    assert.equal((decideCapture(null, facts()) as any).reason, 'order_not_found');
  });

  test('a legacy plan code can never be granted', () => {
    assert.equal(
      (decideCapture(order({ planCode: 'UNLIMITED' }), facts()) as any).reason,
      'plan_not_sellable',
    );
  });
});

describe('the $29.99 ambiguity', () => {
  test('old helper picked the first match (the bug)', () => {
    const old = Object.entries(CATALOG).find(
      ([, c]) => Number.parseFloat(c.amount).toFixed(2) === '29.99',
    );
    assert.equal(old?.[0], 'JEANNIE_PRO', 'UNLIMITED is unreachable at $29.99');
  });

  test('ambiguity is refused when both legacy and current plans are in scope', () => {
    assert.equal(resolveLegacyPlan('29.99', CATALOG, Object.keys(CATALOG)), null);
  });

  test('scoping to sellable plans removes the ambiguity legitimately', () => {
    assert.equal(resolveLegacyPlan('29.99', CATALOG), 'JEANNIE_PRO');
  });

  test('unknown amounts refuse', () => {
    assert.equal(resolveLegacyPlan('0.00', CATALOG), null);
    assert.equal(resolveLegacyPlan('not-a-number', CATALOG), null);
  });
});

describe('catalog and guards', () => {
  test('legacy SKUs cannot be sold', () => {
    assert.equal(isSellablePlan('PRO'), false);
    assert.equal(isSellablePlan('UNLIMITED'), false);
    assert.equal(isSellablePlan('jeannie'), true);
    assert.equal(isSellablePlan('JEANNIE_PRO'), true);
    assert.equal(isSellablePlan(undefined), false);
    assert.equal(isSellablePlan(42), false);
  });

  test('money never drifts through floats', () => {
    assert.equal(toCents('29.99'), 2999);
    assert.equal(toCents('0.1'), 10);
    assert.equal(toCents('44.99'), 4499);
    assert.equal(0.1 + 0.2 === 0.3, false);
    assert.equal((toCents(0.1) ?? 0) + (toCents(0.2) ?? 0), 30);
  });

  test('live mode fails closed', () => {
    assert.equal(liveModeAllowed('sandbox', undefined), true);
    assert.equal(liveModeAllowed('live', 'false'), false);
    assert.equal(liveModeAllowed('live', undefined), false);
    assert.equal(liveModeAllowed('live', 'true'), true);
  });
});

describe('subscription activation is once-only', () => {
  test('first activation grants', () => {
    assert.equal(
      decideActivation({ subscriptionStatus: null, paymentExists: false, paypalStatus: 'ACTIVE' }),
      'grant',
    );
  });

  test('a second click does not grant again', () => {
    assert.equal(
      decideActivation({ subscriptionStatus: 'ACTIVE', paymentExists: true, paypalStatus: 'ACTIVE' }),
      'already_active',
    );
  });

  test('a retried webhook does not grant again', () => {
    assert.equal(
      decideActivation({ subscriptionStatus: 'ACTIVE', paymentExists: false, paypalStatus: 'ACTIVE' }),
      'already_active',
    );
  });

  test('an existing payment alone is enough to stop a re-grant', () => {
    assert.equal(
      decideActivation({ subscriptionStatus: null, paymentExists: true, paypalStatus: 'ACTIVE' }),
      'already_active',
    );
  });

  test('a suspended subscription never grants', () => {
    assert.equal(
      decideActivation({ subscriptionStatus: null, paymentExists: false, paypalStatus: 'SUSPENDED' }),
      'not_active',
    );
  });
});
