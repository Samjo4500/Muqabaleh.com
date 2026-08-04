import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const body = await req.json();
    const { status, reason } = body as { status: 'CANCELLED' | 'REFUNDED'; reason?: string };

    if (!['CANCELLED', 'REFUNDED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const booking = await db.humanBooking.update({
      where: { id },
      data: {
        status,
        cancelledAt: new Date(),
        cancelledBy: auth.adminEmail,
        ...(reason ? { disputeReason: reason } : {}),
      },
    });

    await db.adminLog.create({
      data: {
        action: `BOOKING_${status}`,
        adminEmail: auth.adminEmail!,
        targetType: 'HUMAN_BOOKING',
        targetId: id,
        metadata: JSON.stringify({ reason }),
      },
    });

    return NextResponse.json(booking);
  } catch (err) {
    console.error('PATCH /api/admin/bookings/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
