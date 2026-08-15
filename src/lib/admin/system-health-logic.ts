export type CheckStatus = 'pass' | 'fail' | 'warn' | 'skip';

export type HealthCheckLike = {
  status: CheckStatus;
  critical?: boolean;
  label?: { ar: string; en: string };
};

export function summarizeChecks(checks: HealthCheckLike[]): {
  pass: number;
  fail: number;
  warn: number;
  skip: number;
  total: number;
} {
  return {
    pass: checks.filter((c) => c.status === 'pass').length,
    fail: checks.filter((c) => c.status === 'fail').length,
    warn: checks.filter((c) => c.status === 'warn').length,
    skip: checks.filter((c) => c.status === 'skip').length,
    total: checks.length,
  };
}

export function overallFromChecks(checks: HealthCheckLike[]): 'green' | 'yellow' | 'red' {
  if (checks.some((c) => c.critical && c.status === 'fail')) return 'red';
  if (checks.some((c) => c.status === 'fail' || c.status === 'warn')) return 'yellow';
  return 'green';
}

export function failedCheckLabels(checks: HealthCheckLike[]): string {
  return checks
    .filter((c) => c.status === 'fail')
    .map((c) => c.label?.en || 'check')
    .join(', ');
}

/**
 * Cloud Speech-to-Text:
 * 200/400 = API reachable (400 is expected for a dummy audio payload).
 * 401/403 with API-key / API-disabled wording is an auth mismatch, not an outage.
 */
export function classifyGoogleSpeechHttp(
  status: number,
  body: string,
): 'reachable' | 'auth_mismatch' | 'down' {
  if (status === 200 || status === 400) return 'reachable';
  const text = body.toLowerCase();
  if (status === 401 || status === 403) {
    if (
      text.includes('api keys are not supported') ||
      text.includes('expected oauth') ||
      text.includes('has not been used') ||
      text.includes('is disabled') ||
      text.includes('permission_denied') ||
      text.includes('permission denied') ||
      text.includes('cloud speech-to-text api')
    ) {
      return 'auth_mismatch';
    }
  }
  return 'down';
}

export function classifyGoogleTtsHttp(
  status: number,
  body: string,
): 'reachable' | 'auth_mismatch' | 'down' {
  if (status === 200) return 'reachable';
  // Invalid voice / empty input still proves the API accepted our credentials.
  if (status === 400) return 'reachable';
  const text = body.toLowerCase();
  if (status === 401 || status === 403) {
    if (
      text.includes('api keys are not supported') ||
      text.includes('has not been used') ||
      text.includes('is disabled') ||
      text.includes('permission_denied') ||
      text.includes('permission denied')
    ) {
      return 'auth_mismatch';
    }
  }
  return 'down';
}
