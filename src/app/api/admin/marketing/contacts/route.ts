import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';
import { ensureMarketingContactTable } from '@/lib/marketing/contact';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await ensureMarketingContactTable();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const opted = searchParams.get('opted');
    const source = (searchParams.get('source') || '').trim();
    const format = searchParams.get('format');
    const take = Math.min(Number(searchParams.get('limit') || 200), 2000);

    const where: Record<string, unknown> = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { role: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (opted === '1') where.marketingOptIn = true;
    if (opted === '0') where.marketingOptIn = false;
    if (source) where.source = source;

    const [items, total, optedIn] = await Promise.all([
      db.marketingContact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
      }),
      db.marketingContact.count({ where }),
      db.marketingContact.count({ where: { marketingOptIn: true } }),
    ]);

    if (format === 'csv') {
      const header = [
        'email',
        'name',
        'phone',
        'country',
        'location',
        'industry',
        'experience',
        'role',
        'level',
        'linkedInUrl',
        'locale',
        'source',
        'utmSource',
        'utmMedium',
        'utmCampaign',
        'marketingOptIn',
        'createdAt',
        'lastSeenAt',
      ];
      const rows = items.map((r) =>
        [
          r.email,
          r.name,
          r.phone,
          r.country,
          r.location,
          r.industry,
          r.experience,
          r.role,
          r.level,
          r.linkedInUrl,
          r.locale,
          r.source,
          r.utmSource,
          r.utmMedium,
          r.utmCampaign,
          r.marketingOptIn,
          r.createdAt.toISOString(),
          r.lastSeenAt.toISOString(),
        ]
          .map((v) => {
            const s = v == null ? '' : String(v);
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(','),
      );
      const csv = [header.join(','), ...rows].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="muqabaleh-marketing-contacts.csv"',
        },
      });
    }

    return NextResponse.json({
      items,
      total,
      optedIn,
      take,
    });
  } catch (e) {
    console.error('[admin marketing contacts]', e);
    return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 });
  }
}
