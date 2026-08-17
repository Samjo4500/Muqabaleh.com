import { escapeHtml } from '@/lib/brand/comms';
import { localeFromPreferred } from './constants';
import {
  nurtureHref,
  openPixelHref,
  prefsHref,
  unsubscribeHref,
  type NurtureCampaign,
} from './utm';
import type { NurtureJobCard } from './jobs';

export const NURTURE_SENDER = {
  name: 'Jeannie from Muqabaleh',
  email: 'info@muqabaleh.com',
} as const;

export const NURTURE_REPLY_TO = {
  name: 'Muqabaleh',
  email: 'info@muqabaleh.com',
} as const;

const BG = '#0A0E17';
const CARD = '#0D1117';
const GOLD = '#C9A84C';
const TEAL = '#00D4AA';
const WHITE = '#FFFFFF';
const BODY = 'rgba(255,255,255,0.75)';
const MUTED = 'rgba(255,255,255,0.4)';

export type NurtureMerge = {
  name: string;
  email: string;
  city?: string | null;
  role?: string | null;
  company?: string | null;
  score?: number | null;
  score1?: number | null;
  score2?: number | null;
  strengths?: string[];
  improvements?: string[];
  competencies?: Record<string, number>;
  preferredLanguage?: string | null;
  token: string;
  enrollmentId: string;
  jobs?: NurtureJobCard[];
  jobCount?: number;
  applyDate?: string | null;
  lastJobId?: string | null;
};

function barColor(score: number): string {
  if (score >= 80) return TEAL;
  if (score >= 60) return GOLD;
  return '#6B7280';
}

function barRow(label: string, score: number, isAr: boolean): string {
  const width = Math.max(4, Math.min(100, score));
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:${BODY};text-align:${isAr ? 'right' : 'left'};">${escapeHtml(label)}</td>
    <td style="padding:6px 8px;width:58%;">
      <div style="background:rgba(255,255,255,0.08);border-radius:99px;height:8px;">
        <div style="width:${width}%;height:8px;border-radius:99px;background:${barColor(score)};"></div>
      </div>
    </td>
    <td style="padding:6px 0;font-size:13px;color:${WHITE};font-weight:700;width:40px;">${score}</td>
  </tr>`;
}

function jobCardsHtml(
  jobs: NurtureJobCard[],
  locale: 'en' | 'ar',
  campaign: NurtureCampaign,
  emailNumber: number,
): string {
  const isAr = locale === 'ar';
  return jobs
    .map((job) => {
      const path =
        job.companySlug && job.jobSlug
          ? `/companies/${job.companySlug}/${job.jobSlug}`
          : '/jobs';
      const href = nurtureHref({
        path,
        locale,
        campaign,
        emailNumber,
        extra: job.jobId ? { job: job.jobId } : undefined,
      });
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;background:#111827;border:1px solid rgba(255,255,255,0.06);border-radius:16px;">
        <tr>
          <td style="padding:16px 18px;text-align:${isAr ? 'right' : 'left'};">
            <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${TEAL};font-weight:700;">${escapeHtml(job.company)}</div>
            <div style="margin-top:6px;font-size:18px;font-weight:800;color:${WHITE};">${escapeHtml(job.role)}</div>
            <div style="margin-top:4px;font-size:13px;color:${MUTED};">${escapeHtml(job.location)}${job.department ? ` · ${escapeHtml(job.department)}` : ''}</div>
            <a href="${href}" style="display:inline-block;margin-top:12px;color:${GOLD};font-size:13px;font-weight:800;text-decoration:none;">${isAr ? 'تدرّب على هذه الوظيفة ←' : 'PRACTICE FOR THIS ROLE →'}</a>
          </td>
        </tr>
      </table>`;
    })
    .join('');
}

function dualCta(
  locale: 'en' | 'ar',
  campaign: NurtureCampaign,
  emailNumber: number,
): string {
  const isAr = locale === 'ar';
  const practice = nurtureHref({
    path: '/interview/prep',
    locale,
    campaign,
    emailNumber,
  });
  const jobs = nurtureHref({ path: '/jobs', locale, campaign, emailNumber });
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 8px;">
    <tr>
      <td align="center" style="padding:0 0 10px;">
        <a href="${practice}" style="display:inline-block;min-width:200px;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">${isAr ? 'تدرّب مرة أخرى' : 'PRACTICE AGAIN'}</a>
      </td>
    </tr>
    <tr>
      <td align="center">
        <a href="${jobs}" style="display:inline-block;min-width:200px;border:1px solid ${TEAL};color:${TEAL};font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">${isAr ? 'تصفّح الوظائف' : 'BROWSE ROLES'}</a>
      </td>
    </tr>
  </table>`;
}

export function nurtureEmailShell(opts: {
  locale: 'en' | 'ar';
  title: string;
  preview: string;
  bodyHtml: string;
  token: string;
  enrollmentId: string;
}): string {
  const isAr = opts.locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const align = isAr ? 'right' : 'left';
  const font = isAr
    ? "'Noto Naskh Arabic','Segoe UI',Tahoma,Arial,sans-serif"
    : "'Segoe UI','Helvetica Neue',Arial,sans-serif";
  const prefs = prefsHref(opts.token, opts.locale);
  const unsub = unsubscribeHref(opts.token, opts.locale);
  const pixel = openPixelHref(opts.token, opts.enrollmentId);
  const footer = isAr
    ? `تفضيلات البريد: <a href="${prefs}" style="color:${GOLD};text-decoration:none;">إدارة التفضيلات</a> · <a href="${unsub}" style="color:${MUTED};text-decoration:none;">إلغاء الاشتراك</a>`
    : `Email preferences: <a href="${prefs}" style="color:${GOLD};text-decoration:none;">Manage</a> · <a href="${unsub}" style="color:${MUTED};text-decoration:none;">Unsubscribe</a>`;

  return `<!DOCTYPE html>
<html lang="${opts.locale}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:${font};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${CARD};border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
          <tr>
            <td style="padding:22px 24px 8px;text-align:center;">
              <div style="font-size:18px;font-weight:700;color:${GOLD};letter-spacing:0.08em;">MUQABALEH · مقابلة</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;text-align:${align};color:${WHITE};">
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:800;color:${WHITE};">${escapeHtml(opts.title)}</h1>
              <div style="font-size:16px;line-height:1.7;color:${BODY};">
                ${opts.bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px 26px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${MUTED};">MUQABALEH.COM</p>
              <p style="margin:0;font-size:12px;color:${MUTED};">${footer}</p>
              <img src="${pixel}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function competencyRows(merge: NurtureMerge, isAr: boolean): string {
  const entries = Object.entries(merge.competencies || {});
  if (!entries.length) {
    const fallback = [
      [isAr ? 'التواصل' : 'Communication', merge.score ?? 80],
      [isAr ? 'العمق التقني' : 'Technical Depth', Math.max(50, (merge.score ?? 80) - 8)],
      [isAr ? 'حل المشكلات' : 'Problem Solving', Math.max(50, (merge.score ?? 80) - 4)],
    ] as Array<[string, number]>;
    return fallback.map(([l, s]) => barRow(l, s, isAr)).join('');
  }
  return entries.slice(0, 5).map(([l, s]) => barRow(l, s, isAr)).join('');
}

export function renderNurtureEmail(opts: {
  sequence: string;
  step: number;
  merge: NurtureMerge;
}): { subject: string; html: string; campaign: NurtureCampaign } | null {
  const locale = localeFromPreferred(opts.merge.preferredLanguage);
  const isAr = locale === 'ar';
  const name = firstName(opts.merge.name || (isAr ? 'مرحباً' : 'there'));
  const score = opts.merge.score ?? 0;
  const strength = opts.merge.strengths?.[0] || (isAr ? 'وضوح الإجابة' : 'clear answers');
  const improve =
    opts.merge.improvements?.[0] || (isAr ? 'إضافة أرقام للقصص' : 'adding numbers to stories');
  const role = opts.merge.role || (isAr ? 'هذه الوظيفة' : 'this role');
  const company = opts.merge.company || 'Careem';
  const city = opts.merge.city && opts.merge.city !== 'Other' ? opts.merge.city : 'Dubai';
  const jobs = opts.merge.jobs || [];
  const jobCount = opts.merge.jobCount ?? 403;

  if (opts.sequence === 'NEW_SIGNUP') {
    return renderSignup(opts.step, {
      locale,
      isAr,
      name,
      score,
      strength,
      improve,
      role,
      city,
      jobs,
      jobCount,
      merge: opts.merge,
    });
  }
  if (opts.sequence === 'ACTIVE_PRACTICERS') {
    return renderActive(opts.step, {
      locale,
      isAr,
      name,
      score,
      strength,
      improve,
      company,
      merge: opts.merge,
    });
  }
  if (opts.sequence === 'JOB_SEEKERS') {
    return renderJobSeekers(1, {
      locale,
      isAr,
      name,
      role,
      city,
      jobs,
      jobCount,
      merge: opts.merge,
    });
  }
  if (opts.sequence === 'JOB_CLICK') {
    return renderJobSeekers(2, {
      locale,
      isAr,
      name,
      role,
      city,
      jobs,
      jobCount,
      merge: opts.merge,
      company,
    });
  }
  if (opts.sequence === 'APPLY_FOLLOWUP') {
    return renderJobSeekers(3, {
      locale,
      isAr,
      name,
      role,
      city,
      jobs,
      jobCount,
      merge: opts.merge,
      company,
      score,
    });
  }
  return null;
}

function renderSignup(
  step: number,
  ctx: {
    locale: 'en' | 'ar';
    isAr: boolean;
    name: string;
    score: number;
    strength: string;
    improve: string;
    role: string;
    city: string;
    jobs: NurtureJobCard[];
    jobCount: number;
    merge: NurtureMerge;
  },
): { subject: string; html: string; campaign: NurtureCampaign } | null {
  const campaign: NurtureCampaign = 'new_signup_sequence';
  const { locale, isAr, name, score, strength, improve, role, city, jobs, jobCount, merge } =
    ctx;

  if (step === 1) {
    const subject = isAr
      ? `جواز مقابلة جاهز — ${score}/100`
      : `Your Muqabaleh Passport is ready — ${score}/100`;
    const preview = isAr
      ? `اطّلع على تفصيل درجاتك ونقاط قوتك.`
      : `Communication and technical depth — see your full breakdown inside.`;
    const strengths = (merge.strengths || []).slice(0, 2);
    const improvements = (merge.improvements || []).slice(0, 2);
    const body = `
      <p style="margin:0 0 14px;">${isAr ? `مرحباً ${escapeHtml(name)}،` : `Hi ${escapeHtml(name)},`}</p>
      <p style="margin:0 0 18px;">${isAr ? 'جيني أنهت تحليل مقابلتك. هذا جوازك الموثّق:' : "Jeannie finished analyzing your interview. Here's your verified Muqabaleh Passport:"}</p>
      <table role="presentation" width="100%" style="margin:0 0 18px;background:#111827;border-radius:16px;border:1px solid rgba(201,168,76,0.35);">
        <tr><td style="padding:22px 18px;text-align:center;">
          <div style="font-size:48px;font-weight:900;color:${GOLD};line-height:1;">${score} <span style="font-size:18px;color:${WHITE};">/ 100</span></div>
          <div style="margin-top:8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${TEAL};font-weight:700;">${isAr ? 'درجة جاهزية للتوظيف' : 'HIRE-READY SCORE'}</div>
        </td></tr>
        <tr><td style="padding:0 18px 18px;">
          <table role="presentation" width="100%">${competencyRows(merge, isAr)}</table>
        </td></tr>
      </table>
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${TEAL};font-weight:700;">${isAr ? 'نقاط قوتك' : 'YOUR STRENGTHS'}</p>
      ${strengths.map((s) => `<p style="margin:0 0 6px;">${escapeHtml(s)}</p>`).join('') || `<p style="margin:0 0 6px;">${escapeHtml(strength)}</p>`}
      <p style="margin:16px 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};font-weight:700;">${isAr ? 'للتحسين' : 'TO IMPROVE'}</p>
      <ul style="margin:0;padding-${isAr ? 'right' : 'left'}:18px;">
        ${(improvements.length ? improvements : [improve]).map((s) => `<li style="margin:0 0 6px;">${escapeHtml(s)}</li>`).join('')}
      </ul>
      <p style="margin:18px 0 0;">${isAr ? `تدرّب مرة أخرى لتحسين درجتك — أو تصفّح أكثر من ${jobCount} وظيفة حيّة في المنطقة.` : `Practice again with Jeannie to improve your score — or browse ${jobCount}+ live MENA roles.`}</p>
      ${dualCta(locale, campaign, 1)}
    `;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: isAr ? 'جوازك جاهز' : 'Your Passport is Ready',
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  if (step === 2) {
    const subject = isAr
      ? 'الخطأ الأول الذي يقع فيه المرشحون في مقابلات المنطقة'
      : 'The #1 mistake candidates make in MENA interviews';
    const preview = isAr
      ? 'ليس سيرتك. ليست خبرتك. إنه شيء واحد.'
      : "It's not your CV. It's not your experience. It's this one thing.";
    const practice = nurtureHref({
      path: '/interview/prep',
      locale,
      campaign,
      emailNumber: 2,
    });
    const body = isAr
      ? `<p style="margin:0 0 14px;">مرحباً ${escapeHtml(name)}،</p>
         <p style="margin:0 0 14px;">شاهدت آلاف المرشحين يتدرّبون مع جيني.</p>
         <p style="margin:0 0 14px;">من يحصل على العرض؟ لا يكتفي بالإجابة. يروي قصصاً فيها أرقام.</p>
         <p style="margin:0 0 8px;color:${MUTED};">ضعيف: «حسّنت العملية.»</p>
         <p style="margin:0 0 14px;">قوي: «اختصرت زمن التسليم من 14 يوماً إلى 4، وجدّد العميل العقد بزيادة 30%.»</p>
         <p style="margin:0 0 14px;">جوازك أبرز <strong style="color:${WHITE};">${escapeHtml(strength)}</strong> كميزتك. لكن <strong style="color:${WHITE};">${escapeHtml(improve)}</strong> هو المكان الذي يخسر فيه معظم المرشحين العرض.</p>
         <p style="margin:0 0 18px;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">تدرّب مرة أخرى — مجاناً ←</a></p>
         <p style="margin:0;color:${MUTED};font-size:14px;">هذه المرة ستركّز جيني تحديداً على ${escapeHtml(improve)}.<br/>إذا كنت تتقدّم في دبي، هذا أهم: مديرو التوظيف يتوقعون أرقاماً في كل إجابة.</p>`
      : `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
         <p style="margin:0 0 14px;">I've watched thousands of candidates practice with Jeannie.</p>
         <p style="margin:0 0 14px;">The ones who get hired? They don't just answer questions. They tell stories with numbers.</p>
         <p style="margin:0 0 8px;color:${MUTED};">Weak: "I improved the process."</p>
         <p style="margin:0 0 14px;">Strong: "I cut delivery time from 14 days to 4, and the client renewed at 30% higher contract value."</p>
         <p style="margin:0 0 14px;">Your Muqabaleh Passport flagged <strong style="color:${WHITE};">${escapeHtml(strength)}</strong> as your edge. But <strong style="color:${WHITE};">${escapeHtml(improve)}</strong> is where most candidates lose the offer.</p>
         <p style="margin:0 0 18px;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">PRACTICE AGAIN — FREE →</a></p>
         <p style="margin:0;color:${MUTED};font-size:14px;">This time, Jeannie will drill specifically on ${escapeHtml(improve)}.<br/>P.S. If you're applying in Dubai, hiring managers expect metrics in every answer.</p>`;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: subject,
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  if (step === 3) {
    const subject = isAr
      ? `3 وظائف ${escapeHtml(role)} في ${escapeHtml(city)} — تقدّم بجوازك`
      : `3 ${role} roles in ${city} — apply with your passport`;
    const preview = isAr
      ? 'جوازك يعطيك أفضلية. إليك 3 وظائف لتستخدمه عليها.'
      : 'Your Muqabaleh Passport gives you an edge. Here are 3 roles to use it on.';
    const browse = nurtureHref({
      path: '/jobs',
      locale,
      campaign,
      emailNumber: 3,
    });
    const body = `
      <p style="margin:0 0 14px;">${isAr ? `مرحباً ${escapeHtml(name)}،` : `Hi ${escapeHtml(name)},`}</p>
      <p style="margin:0 0 16px;">${isAr ? `حصلت على ${score}/100. هذا ضمن أعلى المرشحين الذين رأيناهم في المنطقة. ثلاث شركات تبحث عن هذه الإشارة الآن:` : `You scored ${score}/100. That's among the strongest signals we've seen in MENA. Three companies are looking for that exact signal right now:`}</p>
      ${jobCardsHtml(jobs, locale, campaign, 3)}
      <p style="margin:16px 0 18px;">${isAr ? 'كل جلسة تدريب تُصمَّم على أسلوب مقابلة الشركة.' : "Each practice session is tailored to the company's interview style."}</p>
      <p style="margin:0;text-align:center;"><a href="${browse}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">${isAr ? `تصفّح أكثر من ${jobCount} وظيفة ←` : `BROWSE ${jobCount}+ LIVE ROLES →`}</a></p>
    `;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: isAr ? 'وظائف تناسب ملفك' : 'Roles matching your profile',
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  if (step === 4) {
    const subject = isAr
      ? `${name}، المرشحون الذين يتدرّبون مرتين يصلون إلى 94+`
      : 'The candidates who practice twice get 94+ scores';
    const preview = isAr
      ? 'جلسة واحدة تجهّزك. جلستان توظّفك.'
      : 'One session gets you ready. Two sessions gets you hired.';
    const practice = nurtureHref({
      path: '/interview/prep',
      locale,
      campaign,
      emailNumber: 4,
    });
    const body = isAr
      ? `<p style="margin:0 0 14px;">مرحباً ${escapeHtml(name)}،</p>
         <p style="margin:0 0 14px;">سارة المنصوري تدرّبت مرة. حصلت على 86. تدرّبت مرة أخرى بعد 3 أيام. حصلت على 94.</p>
         <p style="margin:0 0 8px;">ماذا تغيّر؟</p>
         <p style="margin:0 0 6px;">→ أضافت أرقاماً إلى إجابة «حدّثني عن نفسك»</p>
         <p style="margin:0 0 6px;">→ استخدمت هيكل STAR الذي أوصت به جيني</p>
         <p style="margin:0 0 14px;">→ أصلحت فجوة «العمق التقني» في جوازها الأول</p>
         <p style="margin:0 0 18px;">جوازك الأول أظهر <strong style="color:${WHITE};">${escapeHtml(improve)}</strong> كفجوتك. معظم المرشحين يتجاهلونها. من يُوظَّفون يصلحونها.</p>
         <p style="margin:0;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">تدرّب مرة أخرى — مجاناً ←</a></p>`
      : `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
         <p style="margin:0 0 14px;">Sara Al-Mansouri practiced once. Scored 86. She practiced again 3 days later. Scored 94.</p>
         <p style="margin:0 0 8px;">What changed?</p>
         <p style="margin:0 0 6px;">→ She added metrics to her "tell me about yourself" answer</p>
         <p style="margin:0 0 6px;">→ She used the STAR structure Jeannie recommended</p>
         <p style="margin:0 0 14px;">→ She fixed the technical-depth gap flagged in her first passport</p>
         <p style="margin:0 0 18px;">Your first passport showed <strong style="color:${WHITE};">${escapeHtml(improve)}</strong> as your gap. Most candidates ignore it. The hired ones fix it.</p>
         <p style="margin:0;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">PRACTICE AGAIN — FREE →</a></p>`;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: isAr ? 'درجتك يمكن أن تتحسّن' : 'Your score can improve',
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  if (step === 5) {
    const subject = isAr
      ? `${name}، هل ما زلت تتقدّم لمقابلات؟`
      : `${name}, are you still interviewing?`;
    const preview = isAr
      ? 'إذا وجدت وظيفة، ردّ علينا. إن لم تجد، إليك دفعة أخيرة.'
      : "If you found a role, hit reply and let us know. If not, here's one more push.";
    const pause = prefsHref(merge.token, locale);
    const body = isAr
      ? `<p style="margin:0 0 14px;">مرحباً ${escapeHtml(name)}،</p>
         <p style="margin:0 0 14px;">مرّت 10 أيام على تدرّبك مع جيني.</p>
         <p style="margin:0 0 14px;">إذا حصلت على الوظيفة — ردّ وأخبرنا. نحب الاحتفال بالنجاح.</p>
         <p style="margin:0 0 8px;">إذا ما زلت تبحث، هذا ما أنصح به:</p>
         <p style="margin:0 0 6px;">1. تدرّب مرة أخرى (الدرجات ترتفع 8–12 نقطة في المتوسط)</p>
         <p style="margin:0 0 6px;">2. تصفّح أكثر من ${jobCount} وظيفة حيّة</p>
         <p style="margin:0 0 16px;">3. تقدّم بجوازك — يميّزك عن سيل السير الذاتية</p>
         ${dualCta(locale, campaign, 5)}
         <p style="margin:16px 0 0;font-size:14px;color:${MUTED};">إذا لم تكن تبحث الآن، لا بأس. <a href="${pause}" style="color:${GOLD};">إيقاف الرسائل — سأعود عندما أكون جاهزاً</a></p>
         <p style="margin:12px 0 0;">بالتوفيق.<br/>— فريق مقابلة</p>`
      : `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
         <p style="margin:0 0 14px;">It's been 10 days since you practiced with Jeannie.</p>
         <p style="margin:0 0 14px;">If you landed the role — reply and tell us. We love celebrating wins.</p>
         <p style="margin:0 0 8px;">If you're still searching, here's what I'd do:</p>
         <p style="margin:0 0 6px;">1. Practice one more time (scores jump 8–12 points on average)</p>
         <p style="margin:0 0 6px;">2. Browse the ${jobCount}+ live roles</p>
         <p style="margin:0 0 16px;">3. Apply with your passport — it separates you from the CV crowd</p>
         ${dualCta(locale, campaign, 5)}
         <p style="margin:16px 0 0;font-size:14px;color:${MUTED};">If you're not job-hunting right now, no worries. <a href="${pause}" style="color:${GOLD};">Pause emails — I'll reach out when I'm ready</a></p>
         <p style="margin:12px 0 0;">Either way, good luck out there.<br/>— The Muqabaleh Team</p>`;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: subject,
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  return null;
}

function renderActive(
  step: number,
  ctx: {
    locale: 'en' | 'ar';
    isAr: boolean;
    name: string;
    score: number;
    strength: string;
    improve: string;
    company: string;
    merge: NurtureMerge;
  },
): { subject: string; html: string; campaign: NurtureCampaign } | null {
  const campaign: NurtureCampaign = 'active_practicers';
  const { locale, isAr, name, score, strength, company, merge } = ctx;
  const s1 = merge.score1 ?? Math.max(50, score - (merge.score2 ? 0 : 8));
  const s2 = merge.score2 ?? score;
  const delta = s2 - s1;

  if (step === 1) {
    const subject = isAr
      ? `${name}، أنت الآن ضمن أعلى 10% من مرشحي المنطقة`
      : `${name}, you're now in the top 10% of MENA candidates`;
    const preview = isAr
      ? `درجتك انتقلت من ${s1} إلى ${s2}. هذا ما تغيّر.`
      : `Your score jumped from ${s1} to ${s2}. Here's what changed.`;
    const practice = nurtureHref({
      path: '/jobs',
      locale,
      campaign,
      emailNumber: 1,
    });
    const body = isAr
      ? `<p style="margin:0 0 14px;">مرحباً ${escapeHtml(name)}،</p>
         <p style="margin:0 0 14px;">تدرّبت مرتين. معظم الناس لا يفعلون.</p>
         <p style="margin:0 0 6px;">الجلسة 1: ${s1}/100</p>
         <p style="margin:0 0 6px;">الجلسة 2: ${s2}/100</p>
         <p style="margin:0 0 14px;color:${TEAL};font-weight:700;">التحسّن: +${delta} نقطة</p>
         <p style="margin:0 0 14px;">هذا ليس حظاً. هذا تدريب متعمّد.</p>
         <p style="margin:0 0 18px;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">تدرّب على شركة محدّدة ←</a></p>`
      : `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
         <p style="margin:0 0 14px;">You practiced twice. Most people never do.</p>
         <p style="margin:0 0 6px;">Session 1: ${s1}/100</p>
         <p style="margin:0 0 6px;">Session 2: ${s2}/100</p>
         <p style="margin:0 0 14px;color:${TEAL};font-weight:700;">Improvement: +${delta} points</p>
         <p style="margin:0 0 14px;">That's not luck. That's deliberate practice.</p>
         <p style="margin:0 0 18px;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">PRACTICE COMPANY-SPECIFIC →</a></p>`;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: isAr ? 'أنت ضمن الأعلى' : "You're in the top 10%",
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  if (step === 2) {
    const subject = isAr
      ? 'كريم وتمارا وفودكس بانتظارك'
      : 'Careem, Tamara, and Foodics are waiting';
    const preview = isAr
      ? 'تدرّب على الشركة التي تتقدّم إليها. ليست أسئلة عامة.'
      : "Practice for the exact company you're applying to. Not generic questions.";
    const practice = nurtureHref({
      path: '/jobs',
      locale,
      campaign,
      emailNumber: 2,
    });
    const body = isAr
      ? `<p style="margin:0 0 14px;">مرحباً ${escapeHtml(name)}،</p>
         <p style="margin:0 0 14px;">المقابلات التجريبية العامة مفيدة. المخصّصة للشركة تربح العروض.</p>
         <p style="margin:0 0 6px;">• كريم (منتج وتقنية)</p>
         <p style="margin:0 0 6px;">• تمارا (مخاطر والتزام)</p>
         <p style="margin:0 0 6px;">• فودكس (مبيعات وعمليات)</p>
         <p style="margin:0 0 16px;">• وأكثر من 47 شركة في المنطقة</p>
         <p style="margin:0;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">تدرّب لـ ${escapeHtml(company)} ←</a></p>`
      : `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
         <p style="margin:0 0 14px;">Generic mock interviews are fine. Company-specific ones win offers.</p>
         <p style="margin:0 0 6px;">• Careem (product &amp; tech roles)</p>
         <p style="margin:0 0 6px;">• Tamara (risk &amp; compliance)</p>
         <p style="margin:0 0 6px;">• Foodics (sales &amp; ops)</p>
         <p style="margin:0 0 16px;">• And 47 more MENA companies</p>
         <p style="margin:0;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">PRACTICE FOR ${escapeHtml(company).toUpperCase()} →</a></p>`;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: isAr ? 'تدريب مخصّص للشركة' : 'Company-specific mocks',
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  if (step === 3) {
    const subject = isAr
      ? `${name}، مسؤولو التوظيف يطلبون هذا`
      : `${name}, recruiters are asking for this`;
    const preview = isAr
      ? 'من يشارك جوازه يحصل على 3 أضعاف رسائل التوظيف.'
      : 'Candidates with verified passports get 3x more interview callbacks.';
    const share = nurtureHref({
      path: '/interview/prep',
      locale,
      campaign,
      emailNumber: 3,
    });
    const body = isAr
      ? `<p style="margin:0 0 14px;">مرحباً ${escapeHtml(name)}،</p>
         <p style="margin:0 0 14px;">حسب الأرقام: من يشارك جواز مقابلة على لينكدإن يحصل على 3 أضعاف رسائل مسؤولي التوظيف.</p>
         <p style="margin:0 0 8px;">لماذا؟ لأنه يثبت ما تعد به سيرتك.</p>
         <p style="margin:0 0 6px;">جوازك: ${score}/100</p>
         <p style="margin:0 0 16px;">أقوى نقطة: ${escapeHtml(strength)}</p>
         <p style="margin:0;"><a href="${share}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">شارك على لينكدإن ←</a></p>`
      : `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
         <p style="margin:0 0 14px;">We ran the numbers. Candidates who share their Muqabaleh Passport on LinkedIn get 3x more recruiter messages.</p>
         <p style="margin:0 0 8px;">Why? Because it proves what your CV promises.</p>
         <p style="margin:0 0 6px;">Your passport: ${score}/100</p>
         <p style="margin:0 0 16px;">Top strength: ${escapeHtml(strength)}</p>
         <p style="margin:0;"><a href="${share}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">SHARE ON LINKEDIN →</a></p>`;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: isAr ? 'شارك جوازك' : 'Share your passport',
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  return null;
}

function renderJobSeekers(
  step: number,
  ctx: {
    locale: 'en' | 'ar';
    isAr: boolean;
    name: string;
    role: string;
    city: string;
    jobs: NurtureJobCard[];
    jobCount: number;
    merge: NurtureMerge;
    company?: string;
    score?: number;
  },
): { subject: string; html: string; campaign: NurtureCampaign } | null {
  const campaign: NurtureCampaign = 'job_seekers';
  const { locale, isAr, name, role, city, jobs, jobCount, merge } = ctx;
  const company = ctx.company || merge.company || 'this company';
  const score = ctx.score ?? merge.score ?? 80;

  if (step === 1) {
    const subject = isAr
      ? `وظائف ${role} جديدة في ${city} هذا الأسبوع`
      : `New ${role} roles in ${city} this week`;
    const preview = isAr
      ? 'مفلترة حسب ملفك. أصحاب عمل موثّقون فقط.'
      : 'Filtered for your profile. Verified employers only.';
    const browse = nurtureHref({
      path: '/jobs',
      locale,
      campaign,
      emailNumber: 1,
    });
    const body = `
      <p style="margin:0 0 14px;">${isAr ? `مرحباً ${escapeHtml(name)}،` : `Hi ${escapeHtml(name)},`}</p>
      <p style="margin:0 0 16px;">${isAr ? 'وظائف جديدة هذا الأسبوع تناسب ملفك:' : 'New roles dropped this week matching your profile:'}</p>
      ${jobCardsHtml(jobs, locale, campaign, 1)}
      <p style="margin:16px 0 18px;">${isAr ? 'كلها نشطة وجاهزة لجوازك.' : 'All active. All ready for your passport.'}</p>
      <p style="margin:0;text-align:center;"><a href="${browse}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">${isAr ? 'تصفّح كل الوظائف ←' : 'BROWSE ALL →'}</a></p>
    `;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: isAr ? 'وظائف جديدة هذا الأسبوع' : 'New roles this week',
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  if (step === 2) {
    const subject = isAr
      ? `لا تتقدّم إلى ${company} قبل أن تفعل هذا`
      : `Don't apply to ${company} until you do this`;
    const preview = isAr
      ? '5 دقائق تدريب = أداء أقوى بعشر مرات في المقابلة.'
      : '5 minutes of practice = 10x better interview performance.';
    const practice = nurtureHref({
      path: '/interview/prep',
      locale,
      campaign,
      emailNumber: 2,
      extra: merge.lastJobId ? { job: String(merge.lastJobId) } : undefined,
    });
    const body = isAr
      ? `<p style="margin:0 0 14px;">مرحباً ${escapeHtml(name)}،</p>
         <p style="margin:0 0 14px;">اطّلعت على ${escapeHtml(role)} لدى ${escapeHtml(company)}. اختيار ذكي.</p>
         <p style="margin:0 0 14px;">قبل أن تضغط «قدّم»، اقضِ 5 دقائق مع جيني. ستسأل الأسئلة التي تطرحها ${escapeHtml(company)} — بناءً على معيّنين حديثين.</p>
         <p style="margin:0;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">تدرّب على هذه الوظيفة ←</a></p>`
      : `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
         <p style="margin:0 0 14px;">You looked at ${escapeHtml(role)} at ${escapeHtml(company)}. Smart choice.</p>
         <p style="margin:0 0 14px;">Before you hit apply, spend 5 minutes with Jeannie. She'll ask the exact questions ${escapeHtml(company)} asks — based on recent hires.</p>
         <p style="margin:0;"><a href="${practice}" style="display:inline-block;background:${GOLD};color:#0A0E17;font-size:14px;font-weight:800;text-decoration:none;border-radius:24px;padding:14px 22px;">PRACTICE FOR THIS ROLE →</a></p>`;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: isAr ? 'قبل أن تتقدّم' : 'Before you apply',
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  if (step === 3) {
    const subject = isAr
      ? `هل وصلك رد من ${company}؟`
      : `Did you hear back from ${company}?`;
    const preview = isAr
      ? 'إن لم يصل، إليك قالب المتابعة و3 وظائف بديلة.'
      : "If not, here's how to follow up — and 3 backup roles.";
    const date = merge.applyDate || new Date().toISOString().slice(0, 10);
    const body = isAr
      ? `<p style="margin:0 0 14px;">مرحباً ${escapeHtml(name)}،</p>
         <p style="margin:0 0 14px;">تقدّمت إلى ${escapeHtml(role)} لدى ${escapeHtml(company)} قبل 3 أيام.</p>
         <p style="margin:0 0 14px;">وصلك رد؟ إن نعم — مبروك. تدرّب مع جيني مرة أخرى قبل المقابلة.</p>
         <p style="margin:0 0 8px;">إن لا، هذا قالب المتابعة الذي ينجح في المنطقة:</p>
         <div style="margin:0 0 16px;padding:14px 16px;background:#111827;border-radius:12px;color:${BODY};font-size:14px;">
           الموضوع: متابعة — طلب ${escapeHtml(role)}<br/><br/>
           مرحباً،<br/>
           تقدّمت إلى ${escapeHtml(role)} بتاريخ ${escapeHtml(date)}. ما زلت مهتماً جداً.<br/>
           أكملت أيضاً مقابلة تجريبية موثّقة لهذه الوظيفة وحصلت على ${score}/100. يسعدني مشاركة الجواز إن كان مفيداً.<br/><br/>
           مع التحية،<br/>${escapeHtml(name)}
         </div>
         <p style="margin:0 0 12px;">وإليك 3 وظائف مشابهة ما زالت مفتوحة:</p>
         ${jobCardsHtml(jobs, locale, campaign, 3)}`
      : `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
         <p style="margin:0 0 14px;">You applied to ${escapeHtml(role)} at ${escapeHtml(company)} 3 days ago.</p>
         <p style="margin:0 0 14px;">Heard back? If yes — congrats. Practice with Jeannie one more time before the interview.</p>
         <p style="margin:0 0 8px;">If not, here's the follow-up template that works in MENA:</p>
         <div style="margin:0 0 16px;padding:14px 16px;background:#111827;border-radius:12px;color:${BODY};font-size:14px;">
           Subject: Following up — ${escapeHtml(role)} application<br/><br/>
           Hi,<br/>
           I applied for ${escapeHtml(role)} on ${escapeHtml(date)}. I'm still very interested.<br/>
           I've also completed a verified AI mock interview for this role and scored ${score}/100. Happy to share the passport if helpful.<br/><br/>
           Best,<br/>${escapeHtml(name)}
         </div>
         <p style="margin:0 0 12px;">And here are 3 similar roles still open:</p>
         ${jobCardsHtml(jobs, locale, campaign, 3)}`;
    return {
      subject,
      campaign,
      html: nurtureEmailShell({
        locale,
        title: isAr ? 'متابعة الطلب' : 'Application follow-up',
        preview,
        bodyHtml: body,
        token: merge.token,
        enrollmentId: merge.enrollmentId,
      }),
    };
  }

  return null;
}
