import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';
import { getPayPalAccessToken, refundPayPalCapture } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = await req.json().catch(() => ({}));
  const paymentId = String(body.paymentId || '');
  if (!paymentId) {
    return NextResponse.json({ error: 'paymentId required' }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  if (payment.status === PaymentStatus.REFUNDED) {
    return NextResponse.json({ error: 'Already refunded' }, { status: 400 });
  }
  if (!payment.paypalOrderId) {
    return NextResponse.json({ error: 'No PayPal order on payment' }, { status: 400 });
  }

  try {
    const token = await getPayPalAccessToken();
    // paypalOrderId may be order id; capture refunds need capture id.
    // Attempt refund using stored order id as capture id when capture id was persisted there.
    const ok = await refundPayPalCapture(
      token,
      payment.paypalOrderId,
      String(body.reason || 'Admin refund from Muqabaleh Super Admin'),
    );

    if (!ok) {
      return NextResponse.json(
        { error: 'PayPal refund failed — verify capture id is stored in paypalOrderId' },
        { status: 502 },
      );
    }

    await db.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REFUNDED },
    });

    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'REFUND',
        entity: 'payments',
        entityId: payment.id,
        details: { paypalOrderId: payment.paypalOrderId, amount: payment.amount },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin refund]', e);
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
  }
}
