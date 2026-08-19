import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const src = readFileSync(new URL('./social-links.tsx', import.meta.url), 'utf8');

describe('brand social links', () => {
  it('wires the public X profile in the shared footer list', () => {
    assert.match(src, /name: 'X'/);
    assert.match(src, /https:\/\/x\.com\/muqabaleh/);
  });
});
