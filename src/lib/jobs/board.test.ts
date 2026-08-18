import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatBoardPostedOn,
  latestPostedAtIso,
  toJobsBoardCard,
} from './board';

describe('jobs board payload', () => {
  it('strips HTML and drops unused company logo from the card', () => {
    const card = toJobsBoardCard({
      id: '1',
      title: 'Engineer',
      slug: 'engineer',
      location: 'Dubai, UAE',
      department: 'Eng',
      employmentType: 'Full-time',
      description: '<p>Build products for the region. '.repeat(20),
      applyUrl: 'https://example.com/jobs/1',
      source: 'GREENHOUSE',
      salaryLabel: 'AED 20,000/mo',
      postedAt: new Date('2026-08-01T12:00:00.000Z'),
      company: { name: 'Careem', slug: 'careem', country: 'UAE' },
    });
    assert.equal(card.company?.slug, 'careem');
    assert.ok(!('logoUrl' in (card.company || {})));
    assert.ok(!card.description.includes('<'));
    assert.ok(card.description.length <= 160);
    assert.equal(card.postedAt, '2026-08-01T12:00:00.000Z');
    assert.equal(card.salaryLabel, 'AED 20,000/mo');
  });

  it('picks the newest postedAt and formats a date', () => {
    assert.equal(
      latestPostedAtIso([
        { postedAt: '2026-08-01T00:00:00.000Z' },
        { postedAt: '2026-08-10T00:00:00.000Z' },
        { postedAt: null },
      ]),
      '2026-08-10T00:00:00.000Z',
    );
    const label = formatBoardPostedOn('2026-08-10T00:00:00.000Z', 'en');
    assert.ok(label && /10/.test(label) && /2026/.test(label));
  });
});
