import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { brandedEmailShell, sendBrevoEmail } from '@/lib/brevo';
import { MUQABALEH_BRAND } from '@/lib/brand/comms';
import { captureException } from '@/lib/sentry';
import {
  getPayPalAccessToken,
  getPayPalApiBase,
} from '@/lib/paypal';

/**
 * DELETE /api/users/me/delete
 * Soft-delete + anonymize PII, best-effort PayPal cancel, Brevo confirmation.
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const originalEmail = user.email;
    const lang = String(user.language || '').toUpperCase().startsWith('AR')
      ? 'ar'
      : 'en';
    const isAr = lang === 'ar';

    // Best-effort PayPal subscription cancel
    try {
      const subs = await db.paypalSubscription.findMany({
        where: { userId, status: 'ACTIVE' },
      });
      if (subs.length) {
        const token = await getPayPalAccessToken();
        for (const sub of subs) {
          try {
            await fetch(
              `${getPayPalApiBase()}/v1/billing/subscriptions/${sub.paypalSubscriptionId}/cancel`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  reason: 'Account deleted by user',
                }),
              },
            );
            await db.paypalSubscription.update({
              where: { id: sub.id },
              data: { status: 'CANCELLED' },
            });
          } catch (err) {
            console.warn('[delete] PayPal cancel failed', err);
          }
        }
      }
    } catch (err) {
      console.warn('[delete] PayPal lookup failed', err);
    }

    const anonymizedEmail = `deleted+${userId.slice(0, 8)}@deleted.muqabaleh.invalid`;
    // Scramble password so login is impossible; keep non-null column constraint.
    const { hashSync } = await import('bcryptjs');
    const scrambled = hashSync(`deleted-${userId}-${Date.now()}`, 10);
    await db.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: anonymizedEmail,
        name: 'Deleted User',
        passwordHash: scrambled,
        passwordResetToken: null,
        passwordResetExpiry: null,
        sessionsLeft: 0,
      },
    });

    const subject = isAr
      ? 'تم حذف حسابك في مقابلة'
      : 'Your Muqabaleh account has been deleted';
    const html = brandedEmailShell({
      locale: lang,
      eyebrow: isAr ? 'تأكيد الحذف' : 'Deletion confirmed',
      title: isAr ? 'تم حذف حسابك' : 'Your account has been deleted',
      bodyHtml: isAr
        ? `<p style="margin:0;">تم حذف حسابك وبياناتك الشخصية من مقابلة. إذا كان لديك اشتراك PayPal لم يُلغَ تلقائياً، يرجى إلغاؤه من حساب PayPal.</p>`
        : `<p style="margin:0;">Your account and personal data have been deleted from Muqabaleh. If a PayPal subscription was not cancelled automatically, please cancel it in your PayPal account.</p>`,
    });

    await sendBrevoEmail({
      to: originalEmail,
      subject,
      html,
      sender: MUQABALEH_BRAND.senders.system,
    });

    return NextResponse.json({
      message: isAr ? 'تم حذف الحساب' : 'Account deleted',
      ok: true,
    });
  } catch (e) {
    await captureException(e, { area: 'account.delete' });
    console.error('Delete user error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
