import { emailBaseHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function interviewerPayoutSentEmail(props: {
  interviewerName: string;
  locale: 'en' | 'ar';
  amount: string;
  date: string;
  paypalTransactionId?: string;
  periodStart: string;
  periodEnd: string;
}) {
  const { interviewerName, locale, amount, date, paypalTransactionId, periodStart, periodEnd } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? `تم إرسال مستحقاتك بقيمة ${amount}`
    : `Your Payout of ${amount} Has Been Sent`;

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">تم إرسال الدفعة ✅</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${interviewerName}، تم تحويل مستحقاتك بنجاح إلى حساب PayPal الخاص بك.</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">Payout Sent ✅</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${interviewerName}, your payout has been successfully transferred to your PayPal account.</p>`;

  // Amount highlight card
  const amountCard = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;text-align:center;margin-bottom:24px;">
      <tr>
        <td style="padding:24px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">${isAr ? 'المبلغ المُرسل' : 'Amount Sent'}</p>
          <p style="margin:0;font-size:32px;font-weight:700;color:#18181b;">${amount}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#71717a;">${isAr ? 'في' : 'on'} ${date}</p>
        </td>
      </tr>
    </table>`;

  // Earnings period table
  const labelStyle = 'font-size:14px;color:#71717a;padding:12px 16px;border-bottom:1px solid #e4e4e7;width:40%;';
  const valueStyle = 'font-size:14px;font-weight:600;color:#18181b;padding:12px 16px;border-bottom:1px solid #e4e4e7;';

  const summaryRows = isAr
    ? [
        { label: '💰 المبلغ', value: amount },
        { label: '📅 تاريخ التحويل', value: date },
        { label: '📅 فترة الأرباح', value: `${periodStart} — ${periodEnd}` },
        ...(paypalTransactionId ? [{ label: '🔢 رقم العملية (PayPal)', value: paypalTransactionId }] : []),
      ]
    : [
        { label: '💰 Amount', value: amount },
        { label: '📅 Transfer Date', value: date },
        { label: '📅 Earnings Period', value: `${periodStart} — ${periodEnd}` },
        ...(paypalTransactionId ? [{ label: '🔢 PayPal Reference', value: paypalTransactionId }] : []),
      ];

  const summaryTableRows = summaryRows
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

  const note = isAr
    ? `<p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">قد يستغرق وصول المبلغ إلى حسابك من 1 إلى 3 أيام عمل حسب PayPal.</p>`
    : `<p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">The funds may take 1-3 business days to appear in your PayPal account.</p>`;

  const body = `
    ${heading}
    ${amountCard}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:10px;overflow:hidden;margin-bottom:8px;">
      ${summaryTableRows}
    </table>
    ${dividerHtml()}
    ${note}
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
