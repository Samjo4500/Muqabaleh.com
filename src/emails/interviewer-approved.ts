import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function interviewerApprovedEmail(props: {
  interviewerName: string;
  locale: 'en' | 'ar';
}) {
  const { interviewerName, locale } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? 'تمت الموافقة! ابدأ بالربح من مقابلة'
    : "You're Approved! Start Earning on Muqabaleh";

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">مبروك! 🎉</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${interviewerName}، ملفك كمقابل أصبح متاحاً الآن على منصة مقابلة.</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">Congratulations! 🎉</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${interviewerName}, your interviewer profile is now live on Muqabaleh.</p>`;

  const steps = isAr
    ? `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.7;">للبدء بقبول الحجوزات والربح، اتبع هذه الخطوات:</p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
         <tr>
           <td style="padding:10px 0;font-size:14px;color:#3f3f46;line-height:1.7;">
             <strong style="color:#18181b;">1.</strong> حدد أوقات توافرك وأسعارك من لوحة التحكم
           </td>
         </tr>
         <tr>
           <td style="padding:10px 0;font-size:14px;color:#3f3f46;line-height:1.7;">
             <strong style="color:#18181b;">2.</strong> أضف معلومات الدفع (PayPal) لاستلام أرباحك
           </td>
         </tr>
         <tr>
           <td style="padding:10px 0;font-size:14px;color:#3f3f46;line-height:1.7;">
             <strong style="color:#18181b;">3.</strong> ابدأ بقبول الحجوزات وإجراء المقابلات
           </td>
         </tr>
       </table>`
    : `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.7;">To start accepting bookings and earning, follow these steps:</p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
         <tr>
           <td style="padding:10px 0;font-size:14px;color:#3f3f46;line-height:1.7;">
             <strong style="color:#18181b;">1.</strong> Set your availability and pricing from the dashboard
           </td>
         </tr>
         <tr>
           <td style="padding:10px 0;font-size:14px;color:#3f3f46;line-height:1.7;">
             <strong style="color:#18181b;">2.</strong> Add your payment details (PayPal) to receive earnings
           </td>
         </tr>
         <tr>
           <td style="padding:10px 0;font-size:14px;color:#3f3f46;line-height:1.7;">
             <strong style="color:#18181b;">3.</strong> Start accepting bookings and conducting interviews
           </td>
         </tr>
       </table>`;

  const earningsNote = isAr
    ? `<p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;text-align:center;">تحصل على <strong style="color:#18181b;">80%</strong> من رسوم كل جلسة — نحن نتكفل بالباقي.</p>`
    : `<p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;text-align:center;">You earn <strong style="color:#18181b;">80%</strong> of every session fee — we handle the rest.</p>`;

  const ctaButton = buttonHtml(
    `${APP_URL}/interviewer`,
    isAr ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard',
    '#18181b'
  );

  const body = `
    ${heading}
    ${steps}
    ${dividerHtml()}
    ${earningsNote}
    ${ctaButton}
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
