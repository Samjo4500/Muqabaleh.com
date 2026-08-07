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

const CUR = 'AED|SAR|EGP|QAR|KWD|BHD|OMR|JOD|MAD|TND|USD|EUR|GBP|\\$';
const NUM = '[0-9]{1,3}(?:,[0-9]{3})+(?:\\.[0-9]+)?|[0-9]{4,}(?:\\.[0-9]+)?';

/** Pull published pay ranges out of JD text when ATS has no structured field. */
export function salaryFromText(text: string | null | undefined): SalaryFields {
  if (!text) return EMPTY;
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  // AED 15,000 - 25,000 / month | $80,000–$120,000 per year
  const currencyFirst = new RegExp(
    `\\b(${CUR})\\s*(${NUM})\\s*(?:-|–|to|—)\\s*(?:\\1\\s*)?(${NUM})\\s*(?:(?:per\\s+)?(year|month|hour|annum|annually|mo|yr))?`,
    'i',
  );
  // 15,000 - 25,000 AED / month
  const currencyLast = new RegExp(
    `\\b(${NUM})\\s*(?:-|–|to|—)\\s*(${NUM})\\s*(${CUR})\\s*(?:(?:per\\s+)?(year|month|hour|annum|annually|mo|yr))?`,
    'i',
  );

  const m1 = currencyFirst.exec(clean);
  if (m1) {
    const currency = m1[1] === '$' ? 'USD' : m1[1].toUpperCase();
    const min = Number(m1[2].replace(/,/g, ''));
    const max = Number(m1[3].replace(/,/g, ''));
    const interval = normalizeInterval(m1[4] || null);
    const salaryLabel = formatSalaryLabel(min, max, currency, interval);
    return {
      salaryMin: min,
      salaryMax: max,
      salaryCurrency: currency,
      salaryInterval: interval,
      salaryLabel,
    };
  }

  const m2 = currencyLast.exec(clean);
  if (m2) {
    const currency = m2[3] === '$' ? 'USD' : m2[3].toUpperCase();
    const min = Number(m2[1].replace(/,/g, ''));
    const max = Number(m2[2].replace(/,/g, ''));
    const interval = normalizeInterval(m2[4] || null);
    const salaryLabel = formatSalaryLabel(min, max, currency, interval);
    return {
      salaryMin: min,
      salaryMax: max,
      salaryCurrency: currency,
      salaryInterval: interval,
      salaryLabel,
    };
  }

  // Single value: "Salary: AED 18,000/month" or "from AED 18,000"
  const single = new RegExp(
    `\\b(?:salary|compensation|pay|from)\\s*[:-]?\\s*(${CUR})\\s*(${NUM})\\s*(?:\\/|\\s*)?(year|month|hour|mo|yr)?`,
    'i',
  ).exec(clean);
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
