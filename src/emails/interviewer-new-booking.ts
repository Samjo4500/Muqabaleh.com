import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function interviewerNewBookingEmail(props: {
  interviewerName: string;
  locale: 'en' | 'ar';
  userName: string;
  date: string;
  time: string;
  duration: string;
  amountEarned: string;
  meetingLink: string;
}) {
  const { interviewerName, locale, userName, date, time, duration, amountEarned, meetingLink } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? `حجز جديد — ${date} مع ${userName}`
    : `New Session Booked — ${date} with ${userName}`;

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">حجز جديد! 📅</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${interviewerName}، تم حجز جلسة مقابلة جديدة معك.</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">New Session Booked! 📅</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${interviewerName}, a new interview session has been booked with you.</p>`;

  const labelStyle = 'font-size:14px;color:#71717a;padding:12px 16px;border-bottom:1px solid #e4e4e7;width:40%;';
  const valueStyle = 'font-size:14px;font-weight:600;color:#18181b;padding:12px 16px;border-bottom:1px solid #e4e4e7;';

  const detailsRows = isAr
    ? [
        { label: '👤 المرشح', value: userName },
        { label: '📅 التاريخ', value: date },
        { label: '🕐 الوقت', value: time },
        { label: '⏱ المدة', value: duration },
        { label: '💰 أرباحك (80%)', value: amountEarned },
      ]
    : [
        { label: '👤 Candidate', value: userName },
        { label: '📅 Date', value: date },
        { label: '🕐 Time', value: time },
        { label: '⏱ Duration', value: duration },
        { label: '💰 Your Earnings (80%)', value: amountEarned },
      ];

  const detailsTableRows = detailsRows
    .map(
      (r, i) => `<tr>
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

  const reminder = isAr
    ? `<p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">تأكد من الانضمام قبل موعد الجلسة بـ 5 دقائق على الأقل. رابط الاجتماع صالح حتى انتهاء الجلسة.</p>`
    : `<p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">Please join at least 5 minutes before the session. The meeting link remains valid until the session ends.</p>`;

  const body = `
    ${heading}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;overflow:hidden;margin-bottom:8px;">
      ${detailsTableRows}
    </table>
    ${dividerHtml()}
    ${joinButton}
    ${reminder}
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
