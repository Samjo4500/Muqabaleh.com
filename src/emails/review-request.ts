import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function reviewRequestEmail(props: {
  userName: string;
  locale: 'en' | 'ar';
  interviewerName: string;
  bookingId: string;
}) {
  const { userName, locale, interviewerName, bookingId } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? `كيف كانت مقابلتك مع ${interviewerName}؟`
    : `How Was Your Interview with ${interviewerName}?`;

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">شكراً لك، ${userName}! 🎉</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">لقد أكملت مقابلتك مع <strong>${interviewerName}</strong>. يسعدنا أن نعرف رأيك لمساعدتنا في تحسين تجربتك.</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">Thank You, ${userName}! 🎉</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">You've completed your interview with <strong>${interviewerName}</strong>. We'd love to hear your feedback to help us improve your experience.</p>`;

  const ratingTitle = isAr
    ? `<p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;text-align:center;">كيف تقيم تجربتك؟</p>`
    : `<p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;text-align:center;">How would you rate your experience?</p>`;

  const starsHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
      <tr>
        <td style="text-align:center;padding:12px 0;">
          <span style="font-size:36px;letter-spacing:4px;color:#eab308;">★ ★ ★ ★ ★</span>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;padding:0 0 4px;">
          <span style="font-size:13px;color:#a1a1aa;">${isAr ? '1 — ضعيف &nbsp;&nbsp;&nbsp; 5 — ممتاز' : '1 — Poor &nbsp;&nbsp;&nbsp; 5 — Excellent'}</span>
        </td>
      </tr>
    </table>`;

  const ctaText = isAr
    ? `<p style="margin:24px 0 0;font-size:16px;color:#52525b;text-align:center;line-height:1.6;">ساعدنا في التحسن — شاركنا تقييمك وتعليقاتك!</p>`
    : `<p style="margin:24px 0 0;font-size:16px;color:#52525b;text-align:center;line-height:1.6;">Help us improve — share your rating and comments!</p>`;

  const reviewButton = buttonHtml(`${APP_URL}/app/bookings`, isAr ? 'اترك تقييم' : 'Leave a Review');

  const thankYouNote = isAr
    ? `<p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">فريق مقابلة يتمنى لك التوفيق في مقابلاتك القادمة!</p>`
    : `<p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">The Muqabaleh team wishes you the best in your upcoming interviews!</p>`;

  const body = `
    ${heading}
    ${dividerHtml()}
    ${ratingTitle}
    ${starsHtml}
    ${ctaText}
    ${reviewButton}
    ${thankYouNote}
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
