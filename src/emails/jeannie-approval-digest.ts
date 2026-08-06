import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export type ApprovalDigestItem = {
  id: string;
  title: string;
  companyName: string;
  city?: string | null;
  country?: string | null;
  matchScore: number;
  approveUrl: string;
  rejectUrl: string;
};

export async function jeannieApprovalDigestEmail(props: {
  userName: string;
  locale: 'en' | 'ar';
  items: ApprovalDigestItem[];
  remainingPromise: number;
}) {
  const { userName, locale, items, remainingPromise } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? `Jeannie / جيني: ${items.length} فرص بانتظار موافقتك`
    : `Jeannie: ${items.length} roles awaiting your approval`;

  const rows = items
    .map((item) => {
      const place = [item.city, item.country].filter(Boolean).join(', ');
      return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e4e4e7;">
          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#18181b;">${item.title}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#52525b;">${item.companyName}${place ? ` · ${place}` : ''} · match ${item.matchScore}</p>
          <a href="${item.approveUrl}" style="display:inline-block;margin-inline-end:8px;padding:10px 16px;background:#0f766e;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">${isAr ? 'موافقة' : 'Approve'}</a>
          <a href="${item.rejectUrl}" style="display:inline-block;padding:10px 16px;background:#f4f4f5;color:#3f3f46;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">${isAr ? 'رفض' : 'Reject'}</a>
        </td>
      </tr>`;
    })
    .join('');

  const body = isAr
    ? `
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">مرحباً ${userName}</p>
      <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">جيني وجدت فرصاً تناسب أهدافك. وافق فقط على ما تريد — لن تقدّم بدون موافقتك (ليس عشوائياً).</p>
      <p style="margin:0 0 16px;font-size:14px;color:#0f766e;font-weight:600;">متبقي من وعد هذا الشهر: ${remainingPromise} تقديمات</p>
      ${dividerHtml()}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      ${buttonHtml(`${APP_URL}/app/jeannie`, 'افتح مساحة جيني', '#0f766e')}
    `
    : `
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Hi ${userName}</p>
      <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">Jeannie found roles that match your targets. Approve only what you want — she never applies without you (NOT SPAM).</p>
      <p style="margin:0 0 16px;font-size:14px;color:#0f766e;font-weight:600;">Remaining promise this period: ${remainingPromise} applies</p>
      ${dividerHtml()}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      ${buttonHtml(`${APP_URL}/en/app/jeannie`, 'Open Jeannie workspace', '#0f766e')}
    `;

  return { subject, html: emailBaseHtml(body, locale) };
}
