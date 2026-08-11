import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { demoStore, DEMO_PARTNER_ID } from './demo-data';
import type { PartnerRecord } from './types';
import { mapPartnerRow } from './map-partner';

export type PartnerApiKeyContext = {
  partnerId: string;
  partner: PartnerRecord;
  usingDemo: boolean;
  keyId: string;
  scopes: string[];
};

function hashKey(raw: string) {
  return createHash('sha256').update(raw).digest('hex');
}

function extractApiKey(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim() || null;
  }
  const header = req.headers.get('x-api-key') || req.headers.get('x-muqabaleh-api-key');
  return header?.trim() || null;
}

/**
 * Authenticate partner API keys (mqpk_live_… / demo keys).
 * Does not use NextAuth — intended for /api/partner/v1/*.
 */
export async function requirePartnerApiKey(
  req: NextRequest,
  opts?: { scope?: string },
): Promise<PartnerApiKeyContext | NextResponse> {
  const raw = extractApiKey(req);
  if (!raw) {
    return NextResponse.json(
      { error: 'Missing API key. Use Authorization: Bearer mqpk_live_… or x-api-key.' },
      { status: 401 },
    );
  }

  const hashed = hashKey(raw);

  // Demo keys
  const demoMatch = demoStore.apiKeys.find(
    (k) => !k.revokedAt && (k.plaintext === raw || hashKey(k.plaintext || '') === hashed),
  );
  if (demoMatch || demoStore.keyHashes?.[hashed]) {
    const scopes = demoMatch?.scopes || ['read', 'write'];
    if (opts?.scope && !scopes.includes(opts.scope) && !scopes.includes('*')) {
      return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 });
    }
    return {
      partnerId: DEMO_PARTNER_ID,
      partner: demoStore.partner,
      usingDemo: true,
      keyId: demoMatch?.id || 'demo-key',
      scopes,
    };
  }

  try {
    const { db } = await import('@/lib/db');
    const row = await db.partnerApiKey.findFirst({
      where: { keyHash: hashed, revokedAt: null },
      include: { partner: true },
    });
    if (!row || row.partner.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    if (
      opts?.scope &&
      !row.scopes.includes(opts.scope) &&
      !row.scopes.includes('*')
    ) {
      return NextResponse.json({ error: 'Insufficient scope' }, { status: 403 });
    }
    void db.partnerApiKey
      .update({ where: { id: row.id }, data: { lastUsedAt: new Date() } })
      .catch(() => undefined);

    return {
      partnerId: row.partnerId,
      partner: mapPartnerRow(row.partner as unknown as Record<string, unknown>),
      usingDemo: false,
      keyId: row.id,
      scopes: row.scopes,
    };
  } catch (err) {
    console.error('[partner/api-key]', err);
    return NextResponse.json({ error: 'Auth unavailable' }, { status: 503 });
  }
}

export function isApiKeyCtx(
  value: PartnerApiKeyContext | NextResponse,
): value is PartnerApiKeyContext {
  return !(value instanceof NextResponse);
}
