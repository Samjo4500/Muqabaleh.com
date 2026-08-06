import { emailBaseHtml, buttonHtml, dividerHtml, APP_URL } from '@/lib/email';

export async function jeannieEmployerApplyEmail(props: {
  candidateName: string;
  roleTitle: string;
  companyName: string;
  coverLetter?: string | null;
  passportUrl?: string | null;
  locale?: 'en' | 'ar';
}) {
  const {
    candidateName,
    roleTitle,
    companyName,
    coverLetter,
    passportUrl,
    locale = 'en',
  } = props;

  const subject = `Application via Muqabaleh Jeannie — ${candidateName} for ${roleTitle}`;

  const body = `
    <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#18181b;">New candidate application</p>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">
      <strong>${candidateName}</strong> is applying for <strong>${roleTitle}</strong> at <strong>${companyName}</strong>
      through Muqabaleh Jeannie (approve-gated career agent).
    </p>
    ${dividerHtml()}
    ${
      coverLetter
        ? `<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#18181b;">Cover letter</p>
           <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.7;white-space:pre-wrap;">${coverLetter
             .replace(/</g, '&lt;')
             .slice(0, 6000)}</p>`
        : ''
    }
    ${
      passportUrl
        ? `<p style="margin:0 0 8px;font-size:14px;color:#52525b;">Verified Muqabaleh passport:</p>
           ${buttonHtml(passportUrl, 'Verify passport', '#0f766e')}`
        : ''
    }
    <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;">
      Sent by Jeannie on behalf of the candidate after explicit approval.
      Reply to this email to contact the candidate via Muqabaleh support routing · ${APP_URL}
    </p>
  `;

  return { subject, html: emailBaseHtml(body, locale) };
}
