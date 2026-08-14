import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/app/api/admin/_lib';
import { enforceIpRateLimit } from '@/lib/rate-limit';
import {
  FUNNEL_EVENT_NAMES,
  parseFunnelEventBody,
  ratePercent,
  riyadhDayBounds,
  type FunnelEventName,
} from '@/lib/analytics-funnel';

export const runtime = 'nodejs';

function emptyCounts(): Record<FunnelEventName, number> {
  return {
    interview_started: 0,
    interview_completed: 0,
    guide_viewed: 0,
    signup_initiated: 0,
    signup_completed: 0,
  };
}

async function countsForRange(start: Date, end: Date) {
  const rows = await db.funnelEvent.groupBy({
    by: ['name'],
    where: { createdAt: { gte: start, lt: end } },
    _count: { _all: true },
  });
  const counts = emptyCounts();
  for (const row of rows) {
    if (row.name in counts) {
      counts[row.name as FunnelEventName] = row._count._all;
    }
  }
  return counts;
}

/** POST — ingest a funnel event (public, rate-limited). */
export async function POST(req: Request) {
  const blocked = await enforceIpRateLimit('analytics', 60);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = parseFunnelEventBody(body);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 });
  }

  try {
    await db.funnelEvent.create({
      data: {
        name: parsed.name,
        language: parsed.language,
        role: parsed.role,
        durationSeconds: parsed.duration_seconds,
        guideType: parsed.guide_type,
        guideSlug: parsed.guide_slug,
        location: parsed.location,
        plan: parsed.plan,
        path: parsed.path,
      },
    });
  } catch (err) {
    console.error('[api/analytics] insert failed', err);
    // Do not break the product if the migration has not been applied yet.
    return NextResponse.json({ ok: true, stored: false });
  }

  return NextResponse.json({ ok: true });
}

/** GET — founder dashboard (admin only). Yesterday + today in Asia/Riyadh. */
export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const yesterday = riyadhDayBounds(-1);
    const today = riyadhDayBounds(0);

    const [yCounts, tCounts, topGuides] = await Promise.all([
      countsForRange(yesterday.start, yesterday.end),
      countsForRange(today.start, today.end),
      db.funnelEvent.groupBy({
        by: ['guideSlug', 'guideType'],
        where: {
          name: 'guide_viewed',
          createdAt: { gte: yesterday.start, lt: yesterday.end },
          guideSlug: { not: null },
        },
        _count: { _all: true },
        orderBy: { _count: { guideSlug: 'desc' } },
        take: 10,
      }),
    ]);

    const yCompletion = ratePercent(
      yCounts.interview_completed,
      yCounts.interview_started,
    );
    const ySignup = ratePercent(yCounts.signup_completed, yCounts.signup_initiated);
    const tCompletion = ratePercent(
      tCounts.interview_completed,
      tCounts.interview_started,
    );
    const tSignup = ratePercent(tCounts.signup_completed, tCounts.signup_initiated);

    return NextResponse.json({
      timezone: 'Asia/Riyadh',
      events: FUNNEL_EVENT_NAMES,
      yesterday: {
        date: yesterday.label,
        interviewsStarted: yCounts.interview_started,
        interviewsCompleted: yCounts.interview_completed,
        completionRate: yCompletion,
        guideViews: yCounts.guide_viewed,
        signupInitiated: yCounts.signup_initiated,
        signupCompleted: yCounts.signup_completed,
        signupConversionRate: ySignup,
        counts: yCounts,
        topGuides: topGuides.map((g) => ({
          slug: g.guideSlug,
          type: g.guideType,
          views: g._count._all,
        })),
      },
      today: {
        date: today.label,
        interviewsStarted: tCounts.interview_started,
        interviewsCompleted: tCounts.interview_completed,
        completionRate: tCompletion,
        guideViews: tCounts.guide_viewed,
        signupInitiated: tCounts.signup_initiated,
        signupCompleted: tCounts.signup_completed,
        signupConversionRate: tSignup,
        counts: tCounts,
      },
    });
  } catch (err) {
    console.error('[api/analytics] summary failed', err);
    return NextResponse.json({ ok: false, error: 'summary_failed' }, { status: 500 });
  }
}
