import { NextRequest, NextResponse } from 'next/server';
import {
  forbidUnless,
  isConsoleCtx,
  requireConsoleTenant,
} from '@/lib/console/auth';
import {
  createApiKey,
  listApiKeys,
  listWebhooks,
  revokeApiKey,
  upsertWebhook,
} from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;

  const [apiKeys, webhooks] = await Promise.all([
    listApiKeys(auth),
    listWebhooks(auth),
  ]);
  return NextResponse.json({
    ok: true,
    apiKeys,
    webhooks,
    events: ['passport.received', 'candidate.shortlisted', 'interview.completed'],
    tenantId: auth.organizationId,
  });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'manage_settings');
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    name?: string;
    keyId?: string;
    url?: string;
    events?: string[];
  };

  if (body.action === 'create_key') {
    const result = await createApiKey(auth, body.name || 'API key');
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  }
  if (body.action === 'revoke_key' && body.keyId) {
    const ok = await revokeApiKey(auth, body.keyId);
    return NextResponse.json({ ok });
  }
  if (body.action === 'create_webhook' && body.url) {
    const webhook = await upsertWebhook(auth, {
      url: body.url,
      events: body.events || ['passport.received'],
    });
    return NextResponse.json({ ok: true, webhook }, { status: 201 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
