import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  STUDENT100_ADMIN_PATH,
  STUDENT100_ALERT_KIND,
  student100AdminNotification,
  student100InboxHref,
} from './admin-inbox';

describe('student100 contact center', () => {
  it('keeps Student 100 alerts on their own inbox path', () => {
    assert.equal(STUDENT100_ALERT_KIND, 'student100');
    assert.equal(student100InboxHref(), STUDENT100_ADMIN_PATH);
    assert.equal(student100InboxHref('abc'), `${STUDENT100_ADMIN_PATH}?claim=abc`);
  });

  it('marks pending applications as a distinct warn notification', () => {
    const n = student100AdminNotification({
      id: 'c1',
      name: 'Sara',
      email: 'sara@gmail.com',
      university: 'KAU',
      country: 'SA',
      status: 'PENDING',
      proofNote: 'Student ID 123',
    });
    assert.equal(n.kind, 'student100');
    assert.equal(n.severity, 'warn');
    assert.match(n.subject, /^\[Student 100\] Review/);
    assert.match(n.body, /Needs manual review/);
    assert.match(n.body, /Student ID 123/);
    assert.equal(n.href, student100InboxHref('c1'));
  });

  it('still notifies when an academic email auto-activates', () => {
    const n = student100AdminNotification({
      id: 'c2',
      name: 'Ali',
      email: 'ali@kau.edu.sa',
      university: 'KAU',
      country: 'SA',
      status: 'ACTIVATED',
    });
    assert.equal(n.severity, 'info');
    assert.match(n.subject, /Auto-activated/);
  });

  it('writes every apply into the admin inbox, not only email', () => {
    const src = readFileSync(join(process.cwd(), 'src/lib/student100/campaign.ts'), 'utf8');
    assert.match(src, /writeAdminNotification/);
    assert.match(src, /student100AdminNotification/);
  });

  it('pins Student 100 in the admin bell with an S100 badge', () => {
    const bell = readFileSync(join(process.cwd(), 'src/components/admin/AdminNotificationBell.tsx'), 'utf8');
    assert.match(bell, /isStudent100/);
    assert.match(bell, /S100/);
    assert.match(bell, /Alerts & system email/);
    const nav = readFileSync(join(process.cwd(), 'src/lib/admin/nav.ts'), 'utf8');
    assert.match(nav, /id: 'support'/);
    assert.match(nav, /\/admin\/campaigns\/student100/);
  });

  it('keeps Super Admin alerts in the header, not under the language overlay', () => {
    const shell = readFileSync(join(process.cwd(), 'src/app/[locale]/admin/admin-shell.tsx'), 'utf8');
    assert.match(shell, /<header/);
    assert.match(shell, /AdminNotificationBell/);
    assert.match(shell, /variant="inline"/);
    assert.doesNotMatch(shell, /pe-24/);
    assert.doesNotMatch(shell, /<LanguageSwitcherFixed \/>/);
    const lang = readFileSync(join(process.cwd(), 'src/components/chrome/LanguageSwitcherFixed.tsx'), 'utf8');
    assert.match(lang, /variant === 'inline'/);
  });
});
