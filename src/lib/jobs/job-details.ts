/**
 * Compact position details for listed jobs.
 * Stay within fair-use caps — never rehost full JDs.
 */

export const DESC_MAX = 300;
export const REQUIREMENTS_MAX = 400;

export function stripHtml(text: string | null | undefined): string {
  return (text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(
  text: string | null | undefined,
  max: number,
): string {
  const clean = stripHtml(text);
  if (!clean) return '';
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
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

  // Fallback: last third often holds requirements — keep short
  if (clean.length > 180) {
    return truncateText(clean.slice(Math.floor(clean.length * 0.55)), REQUIREMENTS_MAX);
  }
  return null;
}

export function buildRoleSummary(
  title: string,
  location: string,
  department?: string | null,
  employmentType?: string | null,
  body?: string | null,
): string {
  const meta = [location, department, employmentType].filter(Boolean).join(' · ');
  const fromBody = truncateText(body, DESC_MAX);
  if (fromBody && !/^https?:\/\//i.test(fromBody)) return fromBody;
  return truncateText(`${title} — ${meta}`, DESC_MAX) || 'See original posting for full details.';
}
