import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function bookingConfirmationEmail(props: {
  userName: string;
  locale: 'en' | 'ar';
  interviewerName: string;
  interviewerPhoto?: string;
  date: string;
  time: string;
  duration: string;
  meetingLink: string;
  amount: string;
}) {
  const { userName, locale, interviewerName, interviewerPhoto, date, time, duration, meetingLink, amount } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? `تم تأكيد المقابلة — ${interviewerName} بتاريخ ${date}`
    : `Interview Confirmed — ${interviewerName} on ${date}`;

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">تم تأكيد حجزك! ✅</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${userName}، تم تأكيد مقابلتك بنجاح. إليك التفاصيل:</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">Your Booking is Confirmed! ✅</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${userName}, your interview has been confirmed. Here are the details:</p>`;

  // Interviewer card
  const interviewerCard = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;padding:20px;margin-bottom:20px;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle;">
                ${interviewerPhoto
                  ? `<img src="${interviewerPhoto}" alt="${interviewerName}" width="56" height="56" style="border-radius:50%;object-fit:cover;" />`
                  : `<div style="width:56px;height:56px;border-radius:50%;background-color:#18181b;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:700;">${interviewerName.charAt(0)}</div>`
                }
              </td>
              <td style="vertical-align:middle;padding-${isAr ? 'right' : 'left'}:16px;">
                <p style="margin:0 0 2px;font-size:16px;font-weight:600;color:#18181b;">${interviewerName}</p>
                <p style="margin:0;font-size:13px;color:#71717a;">${isAr ? 'المحاور' : 'Interviewer'}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  // Details table
  const labelStyle = 'font-size:14px;color:#71717a;padding:12px 16px;border-bottom:1px solid #e4e4e7;width:40%;';
  const valueStyle = 'font-size:14px;font-weight:600;color:#18181b;padding:12px 16px;border-bottom:1px solid #e4e4e7;';

  const detailsRows = isAr
    ? [
        { label: '📅 التاريخ', value: date },
        { label: '🕐 الوقت', value: time },
        { label: '⏱ المدة', value: duration },
        { label: '💰 المبلغ', value: amount },
      ]
    : [
        { label: '📅 Date', value: date },
        { label: '🕐 Time', value: time },
        { label: '⏱ Duration', value: duration },
        { label: '💰 Amount', value: amount },
      ];

  const detailsTableRows = detailsRows
    .map(
      (r) => `<tr>
        <td style="${labelStyle}">${r.label}</td>
        <td style="${valueStyle}">${r.value}</td>
      </tr>`
    )
    .join('')
    .replace(
      /border-bottom:1px solid #e4e4e7;(\s*<\/td>\s*<\/tr>\s*)$/,
      '$1'
    );

  const joinButton = buttonHtml(meetingLink, isAr ? 'انضمام إلى المكالمة' : 'Join Call', '#18181b');

  const cancelPolicy = isAr
    ? `<p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">يمكنك الإلغاء قبل 24 ساعة لاسترداد المبلغ كاملاً</p>`
    : `<p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">Cancel up to 24h before for full refund</p>`;

  const body = `
    ${heading}
    ${interviewerCard}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;overflow:hidden;margin-bottom:8px;">
      ${detailsTableRows}
    </table>
    ${dividerHtml()}
    ${joinButton}
    ${cancelPolicy}
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
