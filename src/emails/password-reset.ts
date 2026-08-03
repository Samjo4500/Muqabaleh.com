import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function passwordResetEmail(props: {
  userName: string;
  locale: 'en' | 'ar';
  resetLink: string;
}) {
  const { userName, locale, resetLink } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? 'إعادة تعيين كلمة المرور'
    : 'Reset Your Muqabaleh Password';

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">${userName}، إعادة تعيين كلمة المرور 🔐</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">استلمنا طلباً لإعادة تعيين كلمة المرور لحسابك. اضغط على الزر أدناه لتعيين كلمة مرور جديدة.</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">${userName}, Reset Your Password 🔐</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">We received a request to reset your password for your account. Click the button below to set a new password.</p>`;

  const resetButton = buttonHtml(resetLink, isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password');

  const fallbackLink = isAr
    ? `<p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">${isAr ? 'إذا لم يعمل الزر، انسخ الرابط التالي:' : 'If the button doesn\'t work, copy this link:'}<br />
      <a href="${resetLink}" style="color:#18181b;word-break:break-all;">${resetLink}</a></p>`
    : `<p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">If the button doesn't work, copy this link:<br />
      <a href="${resetLink}" style="color:#18181b;word-break:break-all;">${resetLink}</a></p>`;

  const securityNotice = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;background-color:#fffbeb;border:1px solid #fef3c7;border-radius:8px;">
      <tr>
        <td style="padding:16px 20px;font-size:14px;color:#92400e;line-height:1.6;">
          <strong>🔒 ${isAr ? 'تنبيه أمني' : 'Security Notice'}</strong><br />
          ${isAr
            ? 'هذا الرابط ينتهي خلال ساعة واحدة. إذا لم تطلب هذا، تجاهل هذا البريد.'
            : 'This link expires in 1 hour. If you didn\'t request this, ignore this email.'}
        </td>
      </tr>
    </table>`;

  const footerNote = isAr
    ? `<p style="margin:16px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">لم تقم بإعادة تعيين كلمة المرور؟ يمكنك تجاهل هذا البريد بأمان — كلمة مرورك لن تتغير.</p>`
    : `<p style="margin:16px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">Didn't reset your password? You can safely ignore this email — your password won't change.</p>`;

  const body = `
    ${heading}
    ${resetButton}
    ${fallbackLink}
    ${dividerHtml()}
    ${securityNotice}
    ${footerNote}
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
