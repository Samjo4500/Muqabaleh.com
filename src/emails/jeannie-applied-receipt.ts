import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function jeannieAppliedReceiptEmail(props: {
  userName: string;
  locale: 'en' | 'ar';
  title: string;
  companyName: string;
  channel: 'EMAIL' | 'URL_PACKET';
  remainingPromise: number;
  delivered: number;
  promised: number;
}) {
  const { userName, locale, title, companyName, channel, remainingPromise, delivered, promised } =
    props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? `جيني قدّمت لـ ${title}`
    : `Jeannie applied for ${title}`;

  const channelLine =
    channel === 'EMAIL'
      ? isAr
        ? 'أُرسلت حزمة التقديم بالبريد إلى جهة التوظيف مع سيرتك وجوازك.'
        : 'Your application packet was emailed to the employer with your CV and passport.'
      : isAr
        ? 'جهّزت جيني حزمة التقديم ورابط التقديم الخارجي وتتبع الحالة في مساحتك.'
        : 'Jeannie prepared your packet and tracked the external apply link in your workspace.';

  const body = isAr
    ? `
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">تم التقديم يا ${userName}</p>
      <p style="margin:0 0 12px;font-size:15px;color:#52525b;">${title} — ${companyName}</p>
      <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">${channelLine}</p>
      ${dividerHtml()}
      <p style="margin:0 0 8px;font-size:14px;color:#0f766e;font-weight:600;">وعد هذا الشهر: ${delivered}/${promised} · متبقي ${remainingPromise}</p>
      ${buttonHtml(`${APP_URL}/app/jeannie`, 'متابعة التتبع', '#0f766e')}
    `
    : `
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Applied, ${userName}</p>
      <p style="margin:0 0 12px;font-size:15px;color:#52525b;">${title} — ${companyName}</p>
      <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">${channelLine}</p>
      ${dividerHtml()}
      <p style="margin:0 0 8px;font-size:14px;color:#0f766e;font-weight:600;">Period promise: ${delivered}/${promised} · ${remainingPromise} remaining</p>
      ${buttonHtml(`${APP_URL}/en/app/jeannie`, 'Open tracker', '#0f766e')}
    `;

  return { subject, html: emailBaseHtml(body, locale) };
}
