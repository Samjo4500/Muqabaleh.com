import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cronErrorMessage, runEmailCron } from './run-email-cron';

describe('cronErrorMessage', () => {
  it('keeps a short Prisma-style message and drops extra whitespace', () => {
    const msg = cronErrorMessage(
      new Error('  The table `public.nurture_enrollments` does not exist in the current database.  '),
    );
    assert.match(msg, /nurture_enrollments/);
    assert.equal(msg.startsWith(' '), false);
    assert.ok(msg.length <= 200);
  });

  it('caps long strings', () => {
    assert.equal(cronErrorMessage('x'.repeat(500)).length, 200);
  });
});

describe('runEmailCron', () => {
  it('returns 200-shaped JSON when nurture throws and still records email sends', async () => {
    const result = await runEmailCron({
      processEmailQueue: async () => ({ sent: 2, failed: 0 }),
      processNurtureQueue: async () => {
        throw new Error('The table `public.nurture_enrollments` does not exist');
      },
    });
    assert.equal(result.processed, true);
    assert.equal(result.sent, 2);
    assert.equal(result.failed, 0);
    assert.equal(result.nurture.sent, 0);
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0]!, /nurture:/);
    assert.match(result.errors[0]!, /nurture_enrollments/);
  });

  it('isolates a dead email queue from nurture', async () => {
    const result = await runEmailCron({
      processEmailQueue: async () => {
        throw new Error('email_queue missing');
      },
      processNurtureQueue: async () => ({ sent: 1, skipped: 3, failed: 0 }),
    });
    assert.equal(result.sent, 0);
    assert.equal(result.nurture.sent, 1);
    assert.equal(result.nurture.skipped, 3);
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0]!, /emailQueue:/);
  });
});
