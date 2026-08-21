import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runSystemHealthChecks } from './system-health';

describe('system-health checks', () => {
  it('runs system health checks without crashing and returns structured report', async () => {
    const report = await runSystemHealthChecks();
    assert.ok(report);
    assert.ok(Array.isArray(report.checks));
    assert.equal(typeof report.overall, 'string');
    assert.equal(typeof report.durationMs, 'number');

    const checkIds = report.checks.map((c) => c.id);
    assert.ok(checkIds.includes('database'));
    assert.ok(checkIds.includes('gemini'));
    assert.ok(checkIds.includes('auth'));
    assert.ok(checkIds.includes('speech'));
  });
});
