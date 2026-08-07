/**
 * Salary extraction + display helpers for listed jobs.
 * Only surface pay when the employer/ATS published it — never invent ranges.
 */

export type SalaryFields = {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryInterval: string | null;
  salaryLabel: string | null;
};

const EMPTY: SalaryFields = {
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: null,
  salaryInterval: null,
  salaryLabel: null,
};

function normalizeInterval(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes('hour')) return 'hour';
  if (s.includes('month') || s.includes('per-month')) return 'month';
  if (s.includes('year') || s.includes('annum') || s.includes('annual')) return 'year';
  return raw.slice(0, 24);
}

export function formatSalaryLabel(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined,
  interval: string | null | undefined,
): string | null {
  if (!currency && min == null && max == null) return null;
  const cur = (currency || '').toUpperCase() || 'USD';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(n);
  let range = '';
  if (min != null && max != null && min !== max) range = `${fmt(min)}–${fmt(max)}`;
  else if (min != null) range = `${fmt(min)}+`;
  else if (max != null) range = `up to ${fmt(max)}`;
  else return null;
  const iv = normalizeInterval(interval);
  const suffix =
    iv === 'month' ? '/mo' : iv === 'hour' ? '/hr' : iv === 'year' ? '/yr' : '';
  return `${cur} ${range}${suffix}`;
}

export function salaryFromLeverRange(raw: unknown): SalaryFields {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const o = raw as Record<string, unknown>;
  const min = typeof o.min === 'number' ? o.min : null;
  const max = typeof o.max === 'number' ? o.max : null;
  const currency = o.currency ? String(o.currency).toUpperCase() : null;
  const interval = normalizeInterval(o.interval ? String(o.interval) : null);
  const salaryLabel = formatSalaryLabel(min, max, currency, interval);
  if (!salaryLabel) return EMPTY;
  return { salaryMin: min, salaryMax: max, salaryCurrency: currency, salaryInterval: interval, salaryLabel };
}

/** Greenhouse Job Board API compensation blocks when employers enable pay transparency. */
export function salaryFromGreenhouse(job: Record<string, unknown>): SalaryFields {
  const ranges = job.pay_input_ranges ?? job.payInputRanges;
  if (!Array.isArray(ranges) || !ranges.length) return EMPTY;
  const first = ranges[0] as Record<string, unknown>;
  const centsMin = first.min_cents ?? first.minCents;
  const centsMax = first.max_cents ?? first.maxCents;
  const min =
    typeof centsMin === 'number'
      ? Math.round(centsMin / 100)
      : typeof first.min === 'number'
        ? Math.round(first.min)
        : null;
  const max =
    typeof centsMax === 'number'
      ? Math.round(centsMax / 100)
      : typeof first.max === 'number'
        ? Math.round(first.max)
        : null;
  if (min == null && max == null) return EMPTY;
  const currency = String(
    first.currency_type || first.currencyType || first.currency || 'USD',
  )
    .toUpperCase()
    .slice(0, 8);
  const interval = normalizeInterval(
    String(first.unit || first.interval || first.period || 'year'),
  );
  const salaryLabel = formatSalaryLabel(min, max, currency, interval);
  if (!salaryLabel) return EMPTY;
  return {
    salaryMin: min,
    salaryMax: max,
    salaryCurrency: currency,
    salaryInterval: interval,
    salaryLabel,
  };
}

/** Prefer structured ATS pay, then strict JD text extraction. Never invent. */
export function resolveSalary(
  structured: SalaryFields,
  ...textParts: Array<string | null | undefined>
): SalaryFields {
  if (structured.salaryLabel) return structured;
  return salaryFromText(textParts.filter(Boolean).join(' '));
}

/** Pull published pay ranges out of JD text when ATS has no structured field. */
export function salaryFromText(text: string | null | undefined): SalaryFields {
  if (!text) return EMPTY;
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  // AED 15,000 - 25,000 / month | $80,000–$120,000 per year
  const re =
    /\b(AED|SAR|EGP|QAR|KWD|BHD|OMR|JOD|MAD|TND|USD|EUR|GBP|\$)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)\s*(?:-|–|to|—)\s*\1?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)\s*(?:(?:per\s+)?(year|month|hour|annum|annually))?/i;
  const m = clean.match(re);
  if (!m) {
    // Single value: "Salary: AED 18,000/month"
    const single =
      /\b(?:salary|compensation|pay)\s*[:-]?\s*(AED|SAR|EGP|QAR|KWD|BHD|OMR|JOD|MAD|TND|USD|EUR|GBP|\$)\s*([0-9]{1,3}(?:,[0-9]{3})*)\s*(?:\/|\s*)?(year|month|hour|mo|yr)?/i.exec(
        clean,
      );
    if (!single) return EMPTY;
    const currency = single[1] === '$' ? 'USD' : single[1].toUpperCase();
    const min = Number(single[2].replace(/,/g, ''));
    const interval = normalizeInterval(single[3] || 'month');
    const salaryLabel = formatSalaryLabel(min, null, currency, interval);
    return {
      salaryMin: min,
      salaryMax: null,
      salaryCurrency: currency,
      salaryInterval: interval,
      salaryLabel,
    };
  }

  const currency = m[1] === '$' ? 'USD' : m[1].toUpperCase();
  const min = Number(m[2].replace(/,/g, ''));
  const max = Number(m[3].replace(/,/g, ''));
  const interval = normalizeInterval(m[4] || null);
  const salaryLabel = formatSalaryLabel(min, max, currency, interval);
  return {
    salaryMin: min,
    salaryMax: max,
    salaryCurrency: currency,
    salaryInterval: interval,
    salaryLabel,
  };
}
