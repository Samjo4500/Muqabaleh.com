import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function adminDailySummaryEmail(props: {
  date: string;
  totalRevenue: string;
  newSignups: number;
  newBookings: number;
  pendingApplications: number;
  pendingPayouts: number;
}) {
  const { date, totalRevenue, newSignups, newBookings, pendingApplications, pendingPayouts } = props;

  const subject = `Muqabaleh Daily Summary — ${date}`;

  const labelStyle = 'font-size:14px;color:#71717a;padding:12px 16px;border-bottom:1px solid #e4e4e7;width:55%;';
  const valueStyle = 'font-size:14px;font-weight:600;color:#18181b;padding:12px 16px;border-bottom:1px solid #e4e4e7;text-align:right;';

  const rows = [
    { label: '💰 Total Revenue', value: totalRevenue },
    { label: '🆕 New Signups', value: String(newSignups) },
    { label: '📅 New Bookings', value: String(newBookings) },
    { label: '📋 Pending Applications', value: String(pendingApplications) },
    { label: '⏳ Pending Payouts', value: String(pendingPayouts) },
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
    <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">Daily Summary 📊</p>
    <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">Here's an overview of platform activity for <strong>${date}</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;overflow:hidden;margin-bottom:8px;">
      ${tableRows}
    </table>
    ${dividerHtml()}
    ${buttonHtml(`${APP_URL}/admin`, 'Open Admin Dashboard')}
  `;

  return { subject, html: emailBaseHtml(body, 'en') };
}
