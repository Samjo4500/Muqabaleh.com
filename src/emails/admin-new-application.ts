import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function adminNewApplicationEmail(props: {
  interviewerName: string;
  email: string;
  experience: string;
  proposedPrice: string;
}) {
  const { interviewerName, email, experience, proposedPrice } = props;

  const subject = `Action Required: New Interviewer Application from ${interviewerName}`;

  const labelStyle = 'font-size:14px;color:#71717a;padding:12px 16px;border-bottom:1px solid #e4e4e7;width:40%;';
  const valueStyle = 'font-size:14px;font-weight:600;color:#18181b;padding:12px 16px;border-bottom:1px solid #e4e4e7;';

  const rows = [
    { label: '👤 Name', value: interviewerName },
    { label: '✉️ Email', value: `<a href="mailto:${email}" style="color:#18181b;text-decoration:underline;">${email}</a>` },
    { label: '📅 Years of Experience', value: experience },
    { label: '💰 Proposed Price', value: proposedPrice },
  ];

  const tableRows = rows
    .map(
      (r, i) => `<tr>
        <td style="${labelStyle}${i === rows.length - 1 ? 'border-bottom:none;' : ''}">${r.label}</td>
        <td style="${valueStyle}${i === rows.length - 1 ? 'border-bottom:none;' : ''}">${r.value}</td>
      </tr>`
    )
    .join('');

  const body = `
    <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">New Interviewer Application 🔔</p>
    <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">A new interviewer application has been submitted and requires your review.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;overflow:hidden;margin-bottom:8px;">
      ${tableRows}
    </table>
    ${dividerHtml()}
    ${buttonHtml(`${APP_URL}/admin/interviewers`, 'Review in Admin Panel')}
  `;

  return { subject, html: emailBaseHtml(body, 'en') };
}
