import { SignJWT, importPKCS8 } from 'jose';

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

function readServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch (err) {
    console.error('[coach/google-auth] invalid GOOGLE_APPLICATION_CREDENTIALS_JSON', err);
    return null;
  }
}

/** OAuth access token from service-account JSON (server-only). */
export async function getGoogleAccessToken(
  scopes: string[],
): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.accessToken;
  }

  const sa = readServiceAccount();
  if (!sa) return null;

  try {
    const privateKey = await importPKCS8(
      sa.private_key.replace(/\\n/g, '\n'),
      'RS256',
    );
    const iat = Math.floor(now / 1000);
    const exp = iat + 3600;
    const assertion = await new SignJWT({
      scope: scopes.join(' '),
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuer(sa.client_email)
      .setSubject(sa.client_email)
      .setAudience(sa.token_uri || 'https://oauth2.googleapis.com/token')
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(privateKey);

    const res = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[coach/google-auth] token error', res.status, errText.slice(0, 200));
      return null;
    }
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: now + (data.expires_in || 3600) * 1000,
    };
    return data.access_token;
  } catch (err) {
    console.error('[coach/google-auth] failed', err);
    return null;
  }
}

export function hasGoogleApiKey(): boolean {
  return Boolean(
    process.env.GOOGLE_API_KEY?.trim() || process.env.GOOGLE_TTS_API_KEY?.trim(),
  );
}

export function hasGeminiApiKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim(),
  );
}

export function hasGoogleServiceAccount(): boolean {
  return Boolean(readServiceAccount());
}
