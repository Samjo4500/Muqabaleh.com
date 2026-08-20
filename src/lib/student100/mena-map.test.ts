import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MENA_CAPITALS, projectMena } from './mena-map';

describe('student100 MENA hero map', () => {
  it('places Casablanca/Rabat west of Baghdad and Cairo between them', () => {
    const rabat = projectMena(-6.83, 34.02);
    const cairo = projectMena(31.24, 30.04);
    const baghdad = projectMena(44.37, 33.31);
    assert.ok(rabat.x < cairo.x);
    assert.ok(cairo.x < baghdad.x);
    assert.ok(rabat.y > 0 && baghdad.y < 640);
  });

  it('plots a capital for every Student 100 MENA country', () => {
    const codes = new Set(MENA_CAPITALS.map((c) => c.code));
    for (const code of ['SA', 'AE', 'IQ', 'MA', 'EG', 'PS', 'YE', 'IR']) {
      assert.equal(codes.has(code), true, code);
    }
    assert.equal(MENA_CAPITALS.length, 20);
  });
});
