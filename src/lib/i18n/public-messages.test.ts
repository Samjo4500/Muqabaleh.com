import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pickPublicMessages, PUBLIC_MESSAGE_NAMESPACES } from './public-messages';

describe('pickPublicMessages', () => {
  it('keeps marketing namespaces and drops app/admin/console', () => {
    const all = {
      landing: { hero: 'x' },
      common: { ok: 'ok' },
      app: { dashboard: 'nope' },
      admin: { title: 'nope' },
      console: { nav: 'nope' },
      partnerConsole: { x: 1 },
      emails: { subject: 'nope' },
    };
    const picked = pickPublicMessages(all);
    assert.deepEqual(Object.keys(picked).sort(), ['common', 'landing']);
    assert.equal(picked.app, undefined);
    assert.equal(picked.admin, undefined);
    assert.equal(picked.console, undefined);
  });

  it('lists a stable public catalog (no authenticated shells)', () => {
    const forbidden = [
      'app',
      'admin',
      'adminPanel',
      'console',
      'partnerConsole',
      'b2b',
      'emails',
      'call',
      'mobile',
    ];
    for (const key of forbidden) {
      assert.ok(
        !(PUBLIC_MESSAGE_NAMESPACES as readonly string[]).includes(key),
        `public catalog must not include ${key}`,
      );
    }
    assert.ok(PUBLIC_MESSAGE_NAMESPACES.includes('landing'));
    assert.ok(PUBLIC_MESSAGE_NAMESPACES.includes('paypal'));
    assert.ok(PUBLIC_MESSAGE_NAMESPACES.includes('auth'));
  });
});
