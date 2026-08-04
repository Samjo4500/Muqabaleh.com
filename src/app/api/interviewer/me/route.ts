import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/interviewer/me — interviewer's own profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const interviewer = await db.interviewer.findUnique({
      where: { userId },
      include: {
        availability: true,
      },
    });

    if (!interviewer) {
      return NextResponse.json(
        { error: { ar: 'ملف المقابل غير موجود', en: 'Interviewer profile not found' } },
        { status: 404 },
      );
    }

    // Get recent completed bookings count and upcoming bookings
    const [completedCount, upcomingCount, recentPayouts] = await Promise.all([
      db.humanBooking.count({
        where: {
          interviewerId: interviewer.id,
          status: 'COMPLETED',
        },
      }),
      db.humanBooking.count({
        where: {
          interviewerId: interviewer.id,
          status: { in: ['PENDING', 'CONFIRMED'] },
          scheduledAt: { gte: new Date() },
        },
      }),
      db.interviewerPayout.findMany({
        where: { interviewerId: interviewer.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      interviewer: {
        ...interviewer,
        specialties: JSON.parse((interviewer.specialties as string) || '[]'),
        industries: JSON.parse((interviewer.industries as string) || '[]'),
        languages: JSON.parse((interviewer.languages as string) || '["AR"]'),
        stats: {
          completedInterviews: completedCount,
          upcomingBookings: upcomingCount,
          totalEarnings: interviewer.totalEarnings,
        },
        recentPayouts,
      },
    });
  } catch (err) {
    console.error('GET /api/interviewer/me error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء جلب الملف الشخصي', en: 'Error fetching interviewer profile' } },
      { status: 500 },
    );
  }
}
