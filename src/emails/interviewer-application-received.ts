import { emailBaseHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function interviewerApplicationReceivedEmail(props: {
  interviewerName: string;
  locale: 'en' | 'ar';
}) {
  const { interviewerName, locale } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? 'استلمنا طلبك للانضمام كمحاور'
    : 'We Received Your Interviewer Application';

  const heading = isAr
    ? `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">شكراً لتقديمك 🙏</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${interviewerName}، استلمنا طلبك للانضمام كمقابل على منصة مقابلة.</p>`
    : `<p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#18181b;">Thank you for applying 🙏</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">${interviewerName}, we've received your application to join Muqabaleh as an interviewer.</p>`;

  const reviewNote = isAr
    ? `<p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.7;">سيقوم فريقنا بمراجعة طلبك خلال <strong>24-48 ساعة</strong>. نتحقق من الخبرات والشهادات المذكورة لضمان جودة المنصة.</p>`
    : `<p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.7;">Our team will review your application within <strong>24-48 hours</strong>. We verify the experience and certifications you listed to maintain platform quality.</p>`;

  const nextStep = isAr
    ? `<p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.7;">سنتواصل معك عبر البريد الإلكتروني فور الموافقة على طلبك، مع تعليمات لتفعيل حسابك والبدء بقبول الحجوزات.</p>`
    : `<p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.7;">We'll email you once your application is approved, with instructions to activate your account and start accepting bookings.</p>`;

  const footer = isAr
    ? `<p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">إذا كان لديك أي أسئلة، <a href="mailto:support@muqabaleh.com" style="color:#18181b;text-decoration:underline;">تواصل مع فريق الدعم</a></p>`
    : `<p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">If you have any questions, <a href="mailto:support@muqabaleh.com" style="color:#18181b;text-decoration:underline;">contact our support team</a></p>`;

  const body = `
    ${heading}
    ${reviewNote}
    ${dividerHtml()}
    ${nextStep}
    ${dividerHtml()}
    ${footer}
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
