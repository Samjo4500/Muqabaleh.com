import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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

    const interviewer = await db.interviewer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!interviewer) {
      return NextResponse.json(
        { error: { ar: 'ملف المقابل غير موجود', en: 'Interviewer profile not found' } },
        { status: 404 },
      );
    }

    const where: Record<string, unknown> = { interviewerId: interviewer.id };

    if (statusFilter === 'UPCOMING') {
      where.scheduledAt = { gte: new Date() };
      where.status = { in: ['PENDING', 'CONFIRMED'] };
    } else if (statusFilter === 'PAST') {
      where.OR = [
        { scheduledAt: { lt: new Date() } },
        { status: { in: ['COMPLETED', 'CANCELLED'] } },
      ];
    }

    const bookings = await db.humanBooking.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: {
        review: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
    });

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error('GET /api/interviewer/bookings error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء جلب الحجوزات', en: 'Error fetching bookings' } },
      { status: 500 },
    );
  }
}
