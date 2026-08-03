import { emailBaseHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function paymentReceiptEmail(props: {
  userName: string;
  locale: 'en' | 'ar';
  planName: string;
  amount: string;
  date: string;
  transactionId: string;
}) {
  const { userName, locale, planName, amount, date, transactionId } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? 'إيصال شرائك من مقابلة'
    : 'Receipt for Your Muqabaleh Purchase';

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">شكراً لك، ${userName}! 🎉</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">تمت معالجة عملية الشراء بنجاح. إليك إيصالك:</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">Thank you, ${userName}! 🎉</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">Your purchase has been processed successfully. Here is your receipt:</p>`;

  const formattedDate = isAr
    ? new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const labelStyle = 'font-size:14px;color:#71717a;padding:12px 16px;border-bottom:1px solid #e4e4e7;width:40%;';
  const valueStyle = 'font-size:14px;font-weight:600;color:#18181b;padding:12px 16px;border-bottom:1px solid #e4e4e7;';

  const rows = isAr
    ? [
        { label: 'الخطة', value: planName },
        { label: 'المبلغ', value: amount },
        { label: 'التاريخ', value: formattedDate },
        { label: 'رقم العملية', value: transactionId },
      ]
    : [
        { label: 'Plan', value: planName },
        { label: 'Amount', value: amount },
        { label: 'Date', value: formattedDate },
        { label: 'Transaction ID', value: transactionId },
      ];

  const tableRows = rows
    .map(
      (r) => `<tr>
        <td style="${labelStyle}">${r.label}</td>
        <td style="${valueStyle}">${r.value}</td>
      </tr>`
    )
    .join('');

  // Remove bottom border from last row
  const tableRowsFixed = tableRows.replace(
    /border-bottom:1px solid #e4e4e7;(\s*<\/td>\s*<\/tr>\s*)$/,
    '$1'
  );

  const thankYou = isAr
    ? `<p style="margin:24px 0 0;font-size:15px;color:#52525b;text-align:center;line-height:1.6;">شكراً لاختيارك <strong style="color:#18181b;">مقابلة</strong>. نتمنى لك التوفيق في مقابلاتك القادمة!</p>`
    : `<p style="margin:24px 0 0;font-size:15px;color:#52525b;text-align:center;line-height:1.6;">Thank you for choosing <strong style="color:#18181b;">Muqabaleh</strong>. We wish you the best in your upcoming interviews!</p>`;

  const body = `
    ${heading}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;overflow:hidden;margin-bottom:8px;">
      ${tableRowsFixed}
    </table>
    ${dividerHtml()}
    ${thankYou}
    <p style="margin:16px 0 0;text-align:center;"><a href="${APP_URL}/app" target="_blank" style="color:#18181b;font-weight:600;font-size:14px;text-decoration:underline;">${isAr ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard'} →</a></p>
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
