import { createHmac, timingSafeEqual } from 'crypto';

function secret() {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.CRON_SECRET ||
    'muqabaleh-jeannie-dev-secret'
  );
}

function b64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromB64url(input: string) {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString(
    'utf8',
  );
}

export type JeannieActionToken = {
  userId: string;
  opportunityId: string;
  action: 'approve' | 'reject';
  exp: number;
};

export function signJeannieActionToken(payload: Omit<JeannieActionToken, 'exp'>, ttlHours = 72) {
  const body: JeannieActionToken = {
    ...payload,
    exp: Date.now() + ttlHours * 60 * 60 * 1000,
  };
  const data = b64url(JSON.stringify(body));
  const sig = createHmac('sha256', secret()).update(data).digest();
  return `${data}.${b64url(sig)}`;
}

export function verifyJeannieActionToken(token: string): JeannieActionToken | null {
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expected = createHmac('sha256', secret()).update(data).digest();
  const got = Buffer.from(sig.replace(/-/g, '+').replace(/_/g, '/') + '==', 'base64');
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  try {
    const parsed = JSON.parse(fromB64url(data)) as JeannieActionToken;
    if (!parsed.userId || !parsed.opportunityId || !parsed.action || !parsed.exp) return null;
    if (parsed.exp < Date.now()) return null;
    if (parsed.action !== 'approve' && parsed.action !== 'reject') return null;
    return parsed;
  } catch {
    return null;
  }
}
