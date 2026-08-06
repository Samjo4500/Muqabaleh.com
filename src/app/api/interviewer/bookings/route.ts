import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BookingStatus } from '@/lib/enums';

// GET /api/interviewer/bookings — list interviewer's bookings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status') || 'ALL';
    const userId = (session.user as Record<string, unknown>).id as string;

    // Try DB
    try {
      const interviewer = await db.interviewer.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (interviewer) {
        const where: Record<string, unknown> = { interviewerId: interviewer.id };

        if (statusFilter === 'UPCOMING') {
          where.scheduledAt = { gte: new Date() };
          where.status = { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] };
        } else if (statusFilter === 'PAST') {
          where.OR = [
            { scheduledAt: { lt: new Date() } },
            { status: { in: [BookingStatus.COMPLETED, BookingStatus.CANCELLED] } },
          ];
        }

        const bookings = await db.humanBooking.findMany({
          where,
          orderBy: { scheduledAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            review: {
              select: { id: true, rating: true },
            },
          },
        });

        return NextResponse.json({
          bookings: bookings.map((b) => ({
            id: b.id,
            candidateName: b.user?.name || b.user?.email || 'Candidate',
            candidateEmail: b.user?.email || '',
            scheduledAt: b.scheduledAt,
            durationMinutes: b.durationMinutes,
            status: b.status,
            meetingLink: b.meetingLink,
            interviewerPayout: b.interviewerPayout,
            priceTotal: b.priceTotal,
            cancelledBy: b.cancelledBy,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt,
            interviewerRating: b.interviewerRating,
            hasEvaluation: Boolean(b.interviewerNotes),
            review: b.review,
          })),
        });
      }
    } catch (dbErr) {
      console.warn('[GET /api/interviewer/bookings] DB unavailable:', dbErr);
    }

    // Fallback: no bookings
    return NextResponse.json({ bookings: [] });
  } catch (err) {
    console.error('GET /api/interviewer/bookings error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء جلب الحجوزات', en: 'Error fetching bookings' } },
      { status: 500 },
    );
  }
}
