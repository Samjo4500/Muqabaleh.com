import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { contentSecurityPolicy, securityHeaders } from './http-headers';

function header(name: string) {
  return securityHeaders.find((h) => h.key === name)?.value;
}

describe('security headers', () => {
  it('denies framing and sniffing', () => {
    assert.equal(header('X-Frame-Options'), 'DENY');
    assert.equal(header('X-Content-Type-Options'), 'nosniff');
    assert.equal(header('X-Permitted-Cross-Domain-Policies'), 'none');
  });

  it('enables HSTS without breaking PayPal popups', () => {
    assert.match(header('Strict-Transport-Security') || '', /max-age=31536000/);
    assert.equal(header('Cross-Origin-Opener-Policy'), 'same-origin-allow-popups');
  });

  it('keeps PayPal, Daily, and analytics in CSP', () => {
    assert.match(contentSecurityPolicy, /www\.paypal\.com/);
    assert.match(contentSecurityPolicy, /\*\.daily\.co/);
    assert.match(contentSecurityPolicy, /googletagmanager\.com/);
    assert.match(contentSecurityPolicy, /frame-ancestors 'none'/);
    assert.doesNotMatch(contentSecurityPolicy, /unsafe-hashes/);
  });
});
