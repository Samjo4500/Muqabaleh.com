import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function welcomeEmail(props: {
  userName: string;
  locale: 'en' | 'ar';
}) {
  const { userName, locale } = props;
  const isAr = locale === 'ar';

  const subject = isAr
    ? 'مرحباً بك في مقابلة — رحلتك تبدأ الآن'
    : 'Welcome to Muqabaleh — Your Interview Journey Starts Now';

  const greeting = isAr
    ? `<p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;">مرحباً ${userName}! 👋</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">أهلاً بك في مقابلة. نحن هنا لمساعدتك في الاستعداد لمقابلاتك القادمة والحصول على وظيفة أحلامك.</p>`
    : `<p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;">Welcome ${userName}! 👋</p>
       <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">Welcome to Muqabaleh. We're here to help you ace your upcoming interviews and land your dream job.</p>`;

  const featuresTitle = isAr
    ? '<p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#18181b;">ما يمكنك فعله:</p>'
    : '<p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#18181b;">What you can do:</p>';

  const features = isAr
    ? [`
      <tr>
        <td style="padding:12px 16px;background-color:#f4f4f5;border-radius:8px;font-size:15px;color:#3f3f46;">
          <strong style="color:#18181b;">🤖 مقابلة مجانية مع الذكاء الاصطناعي</strong><br />
          <span style="color:#71717a;">ابدأ بمقابلة تجريبية فورية مع محاور ذكي</span>
        </td>
      </tr>`,
      `
      <tr>
        <td style="padding:12px 16px;background-color:#f4f4f5;border-radius:8px;font-size:15px;color:#3f3f46;"> 
          <strong style="color:#18181b;">⚡ الترقية إلى Pro</strong><br />
          <span style="color:#71717a;">احصل على مقابلات غير محدودة وتحليلات متقدمة</span>
        </td>
      </tr>`,
      `
      <tr>
        <td style="padding:12px 16px;background-color:#f4f4f5;border-radius:8px;font-size:15px;color:#3f3f46;"> 
          <strong style="color:#18181b;">👤 احجز محاور بشري</strong><br />
          <span style="color:#71717a;">تدرب مع خبراء حقيقيين في مجالك</span>
        </td>
      </tr>`,
    ]
    : [`
      <tr>
        <td style="padding:12px 16px;background-color:#f4f4f5;border-radius:8px;font-size:15px;color:#3f3f46;"> 
          <strong style="color:#18181b;">🤖 Free AI Interview</strong><br />
          <span style="color:#71717a;">Start an instant mock interview with a smart AI interviewer</span>
        </td>
      </tr>`,
      `
      <tr>
        <td style="padding:12px 16px;background-color:#f4f4f5;border-radius:8px;font-size:15px;color:#3f3f46;"> 
          <strong style="color:#18181b;">⚡ Upgrade to Pro</strong><br />
          <span style="color:#71717a;">Get unlimited interviews and advanced analytics</span>
        </td>
      </tr>`,
      `
      <tr>
        <td style="padding:12px 16px;background-color:#f4f4f5;border-radius:8px;font-size:15px;color:#3f3f46;"> 
          <strong style="color:#18181b;">👤 Book a Human Interviewer</strong><br />
          <span style="color:#71717a;">Practice with real industry experts in your field</span>
        </td>
      </tr>`,
    ];

  const ctaSection = isAr
    ? `<p style="margin:24px 0 8px;font-size:16px;color:#52525b;text-align:center;">ابدأ الآن واستعد للنجاح!</p>`
    : `<p style="margin:24px 0 8px;font-size:16px;color:#52525b;text-align:center;">Get started now and prepare to succeed!</p>`;

  const body = `
    ${greeting}
    ${featuresTitle}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${features.join('')}
    </table>
    ${dividerHtml()}
    ${ctaSection}
    ${buttonHtml(`${APP_URL}/app`, isAr ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard')}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
      <tr>
        <td align="center" style="border-radius:8px;background-color:transparent;border:2px solid #18181b;">
          <a href="${APP_URL}/pricing" target="_blank" style="display:inline-block;padding:14px 32px;color:#18181b;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">${isAr ? 'عرض الخطط' : 'View Plans'}</a>
        </td>
      </tr>
    </table>
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
