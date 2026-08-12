/**
 * Post-signup email drip (Brevo via EmailQueue).
 * Day 0 is welcome (immediate). Days 2/5/7/14 are queued.
 * Free-tier-only nudges on Day 7 and Day 14 are re-checked at send time.
 */

import { db } from '@/lib/db';
import { queueEmail } from '@/lib/email';
import { brandedEmailShell, sendBrevoEmail } from '@/lib/brevo';
import { MUQABALEH_BRAND, localePath } from '@/lib/brand/comms';

type Locale = 'en' | 'ar';

function localeFromUserLanguage(language?: string | null): Locale {
  return String(language || '').toUpperCase().startsWith('AR') ? 'ar' : 'en';
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

const DRIP_MARKER = '[mq-drip:';

export type DripDay = 2 | 5 | 7 | 14;

function dripSubject(day: DripDay, isAr: boolean): string {
  switch (day) {
    case 2:
      return isAr
        ? '3 نصائح لاجتياز مقابلتك التجريبية'
        : '3 tips to ace your mock interview';
    case 5:
      return isAr
        ? 'أكثر من 500 مرشح تدرّبوا هذا الأسبوع'
        : '500+ candidates practiced this week';
    case 7:
      return isAr
        ? 'أنت في منتصف أسبوعك المجاني — افتح جوازك مع Pro'
        : "You're halfway through your free trial week. Unlock your passport with Pro.";
    case 14:
      return isAr
        ? 'كيف حصلت سارة على وظيفة في STC بعد 3 مقابلات تدريبية'
        : 'How Sara got hired at STC after 3 practice interviews';
  }
}

function dripBody(day: DripDay, isAr: boolean, name: string): string {
  switch (day) {
    case 2:
      return isAr
        ? `<p style="margin:0 0 12px;">مرحباً ${name}، إليك ثلاث نصائح سريعة قبل جلستك التالية مع جيني:</p>
           <ol style="margin:0;padding-right:18px;line-height:1.8;color:#334155;">
             <li>استخدم أمثلة STAR (موقف، مهمة، إجراء، نتيجة).</li>
             <li>تحدّث بوضوح — الصوت أهم من الكمال.</li>
             <li>راجع تقريرك بعد الجلسة وكرّر نقاط الضعف فقط.</li>
           </ol>`
        : `<p style="margin:0 0 12px;">Hi ${name}, three quick tips before your next Jeannie session:</p>
           <ol style="margin:0;padding-left:18px;line-height:1.8;color:#334155;">
             <li>Use STAR examples (Situation, Task, Action, Result).</li>
             <li>Speak clearly — presence beats perfection.</li>
             <li>Review your scorecard and practice only the weak spots.</li>
           </ol>`;
    case 5:
      return isAr
        ? `<p style="margin:0 0 12px;">أكثر من <strong>500 مرشح</strong> تدرّبوا هذا الأسبوع على مقابلة. أبرز ما تعلّموه:</p>
           <ul style="margin:0;padding-right:18px;line-height:1.8;color:#334155;">
             <li>الإجابات القصيرة المنظمة تفوز على السرد الطويل.</li>
             <li>ممارسة صوتية واحدة تحسّن الثقة أكثر من القراءة فقط.</li>
             <li>جواز المقابلة يساعد على التقديم بثقة أعلى.</li>
           </ul>`
        : `<p style="margin:0 0 12px;"><strong>500+ candidates</strong> practiced on Muqabaleh this week. Here's what they learned:</p>
           <ul style="margin:0;padding-left:18px;line-height:1.8;color:#334155;">
             <li>Short structured answers beat long stories.</li>
             <li>One voice practice session beats reading tips alone.</li>
             <li>A verified passport helps you apply with more confidence.</li>
           </ul>`;
    case 7:
      return isAr
        ? `<p style="margin:0 0 12px;">لقد مرّ نصف أسبوع تجربتك المجانية. مع <strong>Pro</strong> تفتح مقابلات إضافية وجواز مقابلة يصل إلى بريدك.</p>`
        : `<p style="margin:0 0 12px;">You're halfway through your free trial week. With <strong>Pro</strong> you unlock more interviews and a passport PDF emailed to you.</p>`;
    case 14:
      return isAr
        ? `<p style="margin:0 0 12px;">سارة تدرّبت ثلاث مرات مع جيني، حسّنت إجاباتها السلوكية، ثم نجحت في مقابلة STC. قصتها تبدأ بنفس خطوتك الأولى — جلسة تدريبية واحدة.</p>`
        : `<p style="margin:0 0 12px;">Sara practiced three times with Jeannie, tightened her behavioral answers, then landed an STC interview. Her path started with the same first step — one practice session.</p>`;
  }
}

function dripCta(day: DripDay, isAr: boolean): { hrefPath: string; label: string } {
  if (day === 7 || day === 14) {
    return {
      hrefPath: '/#pricing',
      label: isAr ? 'الترقية إلى Pro' : 'Upgrade to Pro',
    };
  }
  return {
    hrefPath: '/interview/prep',
    label: isAr ? 'ابدأ التدريب' : 'Start practicing',
  };
}

/** Queue Day 2/5/7/14 drip emails after signup. Day 0 = welcome (separate). */
export async function scheduleSignupDripEmails(userId: string): Promise<void> {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user?.email) return;

    const lang = localeFromUserLanguage(user.language);
    const isAr = lang === 'ar';
    const name = user.name || (isAr ? 'مرحباً' : 'there');

    for (const day of [2, 5, 7, 14] as DripDay[]) {
      const subject = `${DRIP_MARKER}${day}] ${dripSubject(day, isAr)}`;
      const cta = dripCta(day, isAr);
      const html = brandedEmailShell({
        locale: lang,
        eyebrow: isAr ? 'من مقابلة' : 'From Muqabaleh',
        title: dripSubject(day, isAr),
        bodyHtml: dripBody(day, isAr, name),
        ctaHref: localePath(cta.hrefPath, lang),
        ctaLabel: cta.label,
      });
      await queueEmail({
        to: user.email,
        subject,
        html,
        sendAt: daysFromNow(day),
        from: `Muqabaleh <${MUQABALEH_BRAND.senders.system.email}>`,
      });
    }
  } catch (err) {
    console.error('[email-drip] schedule failed', err);
  }
}

/**
 * Before sending a free-only drip, skip if user upgraded.
 * Returns true if the email should still be sent.
 */
export async function shouldSendDripEmail(
  toEmail: string,
  subject: string,
): Promise<boolean> {
  const match = subject.match(/\[mq-drip:(\d+)\]/);
  if (!match) return true;
  const day = Number(match[1]);
  if (day !== 7 && day !== 14) return true;

  const user = await db.user.findFirst({
    where: { email: toEmail },
    select: { tier: true, isActive: true },
  });
  if (!user || !user.isActive) return false;
  const tier = String(user.tier || 'FREE').toUpperCase();
  return tier === 'FREE';
}

/** Send one drip immediately via Brevo (used by queue processor). */
export async function sendDripViaBrevo(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const cleanSubject = opts.subject.replace(/\[mq-drip:\d+\]\s*/, '');
  return sendBrevoEmail({
    to: opts.to,
    subject: cleanSubject,
    html: opts.html,
    sender: MUQABALEH_BRAND.senders.system,
  });
}
