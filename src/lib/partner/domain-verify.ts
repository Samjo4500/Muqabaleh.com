import { resolveCname, resolveTxt } from 'dns/promises';
import { DEMO_PARTNER_ID, demoStore } from './demo-data';

const EXPECTED_CNAME_TARGETS = [
  'partners.muqabaleh.com',
  'cname.vercel-dns.com',
];

export type DomainVerifyResult = {
  ok: boolean;
  verified: boolean;
  customDomain: string | null;
  checks: {
    cname?: { found: string[]; matched: boolean };
    txt?: { found: string[]; matched: boolean };
  };
  message: string;
};

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .split(':')[0];
}

/**
 * Verify partner custom domain via CNAME → partners.muqabaleh.com
 * or TXT `_muqabaleh-verify.<domain>` containing the partner slug.
 */
export async function verifyPartnerCustomDomain(opts: {
  partnerId: string;
  usingDemo?: boolean;
  slug: string;
  customDomain: string | null;
}): Promise<DomainVerifyResult> {
  const domain = opts.customDomain ? normalizeDomain(opts.customDomain) : null;
  if (!domain) {
    return {
      ok: false,
      verified: false,
      customDomain: null,
      checks: {},
      message: 'Set a custom domain before verifying.',
    };
  }

  if (opts.usingDemo || opts.partnerId === DEMO_PARTNER_ID) {
    demoStore.partner = {
      ...demoStore.partner,
      customDomain: domain,
      customDomainVerified: true,
      updatedAt: new Date().toISOString(),
    };
    return {
      ok: true,
      verified: true,
      customDomain: domain,
      checks: { cname: { found: ['partners.muqabaleh.com'], matched: true } },
      message: 'Demo domain marked verified.',
    };
  }

  const checks: DomainVerifyResult['checks'] = {};
  let matched = false;

  try {
    const cnames = await resolveCname(domain);
    const found = cnames.map((c) => c.replace(/\.$/, '').toLowerCase());
    const cnameMatched = found.some((c) =>
      EXPECTED_CNAME_TARGETS.some((t) => c === t || c.endsWith(`.${t}`)),
    );
    checks.cname = { found, matched: cnameMatched };
    if (cnameMatched) matched = true;
  } catch {
    checks.cname = { found: [], matched: false };
  }

  try {
    const txtHost = `_muqabaleh-verify.${domain}`;
    const txt = await resolveTxt(txtHost);
    const found = txt.map((parts) => parts.join(''));
    const expected = `muqabaleh-verify=${opts.slug}`;
    const txtMatched = found.some(
      (v) => v.includes(expected) || v.trim() === opts.slug,
    );
    checks.txt = { found, matched: txtMatched };
    if (txtMatched) matched = true;
  } catch {
    checks.txt = { found: [], matched: false };
  }

  try {
    const { db } = await import('@/lib/db');
    await db.partner.update({
      where: { id: opts.partnerId },
      data: {
        customDomain: domain,
        customDomainVerified: matched,
      },
    });
  } catch (err) {
    console.error('[partner/domain-verify] persist failed', err);
    return {
      ok: false,
      verified: false,
      customDomain: domain,
      checks,
      message: 'DNS checked but could not save verification status.',
    };
  }

  return {
    ok: true,
    verified: matched,
    customDomain: domain,
    checks,
    message: matched
      ? 'Domain verified. Custom host resolution is now active.'
      : `DNS not ready. Point a CNAME for ${domain} to partners.muqabaleh.com, or add TXT _muqabaleh-verify.${domain} = muqabaleh-verify=${opts.slug}.`,
  };
}
