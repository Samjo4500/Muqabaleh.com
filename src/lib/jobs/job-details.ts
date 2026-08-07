/**
 * Compact position details for listed jobs.
 * Stay within fair-use caps — never rehost full JDs.
 */

export const DESC_MAX = 300;
export const REQUIREMENTS_MAX = 400;

/** Decode common HTML entities before tag stripping. */
function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      const code = parseInt(h, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    });
}

export function stripHtml(text: string | null | undefined): string {
  if (!text) return '';
  let s = String(text);
  // Greenhouse often stores attribute quotes as &quot; inside real tags
  s = decodeEntities(s);
  // Drop tags (repeat in case decode introduced nested markup)
  for (let i = 0; i < 3; i += 1) {
    const next = s.replace(/<[^>]*>/g, ' ');
    if (next === s) break;
    s = next;
  }
  return s.replace(/\s+/g, ' ').trim();
}

/** True when a stored summary still looks like raw ATS HTML. */
export function looksLikeHtml(text: string | null | undefined): boolean {
  if (!text) return false;
  return /<\s*[a-z!/]|class\s*=\s*&quot;|&lt;[a-z]/i.test(text);
}

export function truncateText(
  text: string | null | undefined,
  max: number,
): string {
  const clean = stripHtml(text);
  if (!clean) return '';
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/** Safe plain-text blurb for UI — always strips HTML even if DB was polluted. */
export function safeJobText(
  text: string | null | undefined,
  max = DESC_MAX,
): string {
  return truncateText(text, max);
}

/** Pull a short requirements blurb from ATS/JD text. */
export function extractRequirements(
  text: string | null | undefined,
): string | null {
  const clean = stripHtml(text);
  if (!clean || clean.length < 40) return null;

  const markers =
    /(?:requirements?|what you(?:'ll| will) need|you (?:bring|have)|qualifications?|must have|minimum qualifications)\s*[:\-–]?\s*/i;
  const idx = clean.search(markers);
  if (idx >= 0) {
    const after = clean.slice(idx).replace(markers, '').trim();
    const clipped = truncateText(after, REQUIREMENTS_MAX);
    return clipped || null;
  }

  if (clean.length > 180) {
    return truncateText(clean.slice(Math.floor(clean.length * 0.55)), REQUIREMENTS_MAX);
  }
  return null;
}

function isBoilerplateOpener(text: string): boolean {
  return /^(about us|about the company|who we are|our mission|at [\w.-]+,?\s+we)\b/i.test(
    text.trim(),
  );
}

export function buildRoleSummary(
  title: string,
  location: string,
  department?: string | null,
  employmentType?: string | null,
  body?: string | null,
): string {
  const meta = [location, department, employmentType].filter(Boolean).join(' · ');
  const fallback =
    truncateText(`${title} — ${meta}`, DESC_MAX) ||
    'See original posting for full details.';

  const clean = stripHtml(body);
  if (!clean || /^https?:\/\//i.test(clean)) return fallback;

  // Prefer a later slice when the JD opens with company boilerplate
  const roleCut = clean.search(
    /\b(the role|about the role|what you.?ll do|what you will do|responsibilities|in this role|about this role)\b/i,
  );
  if (roleCut >= 0) {
    const focused = truncateText(clean.slice(roleCut), DESC_MAX);
    if (focused && !isBoilerplateOpener(focused)) return focused;
  }

  const fromBody = truncateText(clean, DESC_MAX);
  if (fromBody && !isBoilerplateOpener(fromBody)) return fromBody;

  // Boilerplate-only intros → short title/meta line instead of "About Us…"
  return fallback;
}
