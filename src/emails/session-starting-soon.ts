import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function sessionStartingSoonEmail(props: {
  userName: string;
  locale: 'en' | 'ar';
  interviewerName: string;
  time: string;
  meetingLink: string;
}) {
  const { userName, locale, interviewerName, time, meetingLink } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? 'مقابلتك تبدأ خلال 15 دقيقة — انضم الآن'
    : 'Your Interview Starts in 15 Minutes — Join Now';

  const urgentBadge = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td align="center" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:8px 20px;">
          <span style="font-size:14px;font-weight:600;color:#dc2626;">⏰ ${isAr ? 'يبدأ قريباً!' : 'Starting Soon!'}</span>
        </td>
      </tr>
    </table>`;

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">${userName}، مقابلتك على وشك البدء! 🚨</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">تبدأ مقابلتك خلال 15 دقيقة. تأكد من جاهزيتك وانضم الآن.</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">${userName}, Your Interview is About to Start! 🚨</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">Your interview begins in 15 minutes. Make sure you're ready and join now.</p>`;

  const labelStyle = 'font-size:14px;color:#71717a;padding:12px 16px;border-bottom:1px solid #e4e4e7;width:40%;';
  const valueStyle = 'font-size:14px;font-weight:600;color:#18181b;padding:12px 16px;border-bottom:1px solid #e4e4e7;';

  const detailsRows = isAr
    ? [
        { label: '👤 المحاور', value: interviewerName },
        { label: '🕐 الوقت', value: time },
      ]
    : [
        { label: '👤 Interviewer', value: interviewerName },
        { label: '🕐 Time', value: time },
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

  const joinButton = buttonHtml(meetingLink, isAr ? 'انضمام إلى المكالمة' : 'Join Call', '#16a34a');

  const tip = isAr
    ? `<p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">💡 تأكد من اتصالك بالإنترنت واختبار كاميرا وميكروفونك قبل الانضمام</p>`
    : `<p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">💡 Make sure your internet is stable and test your camera & mic before joining</p>`;

  const body = `
    ${urgentBadge}
    ${heading}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;overflow:hidden;margin-bottom:8px;">
      ${detailsTableRows}
    </table>
    ${dividerHtml()}
    ${joinButton}
    ${tip}
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
