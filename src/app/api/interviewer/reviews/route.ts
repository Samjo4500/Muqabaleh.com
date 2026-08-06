import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** List reviews for the signed-in interviewer. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const interviewer = await db.interviewer.findUnique({
      where: { userId },
      select: { id: true, rating: true },
    });

    if (!interviewer) {
      return NextResponse.json({ error: 'Interviewer profile not found' }, { status: 404 });
    }

    const reviews = await db.interviewerReview.findMany({
      where: { interviewerId: interviewer.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        booking: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
    });

    const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((r) => r.rating === stars).length,
    }));

    return NextResponse.json({
      averageRating: interviewer.rating ?? 0,
      totalReviews: reviews.length,
      breakdown,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        candidateName: r.booking?.user?.name || null,
      })),
    });
  } catch (err) {
    console.error('[GET /api/interviewer/reviews]', err);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}
