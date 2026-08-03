import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function sessionReminderEmail(props: {
  userName: string;
  locale: 'en' | 'ar';
  interviewerName: string;
  date: string;
  time: string;
  meetingLink: string;
}) {
  const { userName, locale, interviewerName, date, time, meetingLink } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? `تذكير: مقابلتك غداً في ${time}`
    : `Reminder: Your Interview is Tomorrow at ${time}`;

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">تذكير بمقابلتك ⏰</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${userName}، مقابلتك مع <strong style="color:#18181b;">${interviewerName}</strong> غداً.</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">Interview Reminder ⏰</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${userName}, your interview with <strong style="color:#18181b;">${interviewerName}</strong> is tomorrow.</p>`;

  // Session details
  const labelStyle = 'font-size:14px;color:#71717a;padding:12px 16px;border-bottom:1px solid #e4e4e7;width:40%;';
  const valueStyle = 'font-size:14px;font-weight:600;color:#18181b;padding:12px 16px;border-bottom:1px solid #e4e4e7;';

  const detailsRows = isAr
    ? [
        { label: '👤 المحاور', value: interviewerName },
        { label: '📅 التاريخ', value: date },
        { label: '🕐 الوقت', value: time },
      ]
    : [
        { label: '👤 Interviewer', value: interviewerName },
        { label: '📅 Date', value: date },
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

  // Tips
  const tipsTitle = isAr
    ? '<p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#18181b;">💡 نصائح سريعة للتحضير:</p>'
    : '<p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#18181b;">💡 Quick tips to prepare:</p>';

  const tips = isAr
    ? [
        'اختبر كاميرا وميكروفونك',
        'راجع سيرتك الذاتية',
        'جهّز 2-3 أسئلة للمحاور',
      ]
    : [
        'Test your camera/microphone',
        'Review your resume',
        'Prepare 2-3 questions for the interviewer',
      ];

  const tipsList = tips
    .map((tip) => `
      <tr>
        <td style="padding:8px 0;font-size:15px;color:#3f3f46;">
          <span style="display:inline-block;width:8px;height:8px;background-color:#18181b;border-radius:50%;margin-${isAr ? 'right' : 'left'}:12px;vertical-align:middle;"></span>
          ${tip}
        </td>
      </tr>`
    )
    .join('');

  const joinButton = buttonHtml(meetingLink, isAr ? 'انضمام إلى المكالمة' : 'Join Call', '#18181b');

  const body = `
    ${heading}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;overflow:hidden;margin-bottom:8px;">
      ${detailsTableRows}
    </table>
    ${dividerHtml()}
    ${tipsTitle}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${tipsList}
    </table>
    ${dividerHtml()}
    ${joinButton}
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
