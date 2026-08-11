import { NextResponse } from 'next/server';
import {
  isConsoleCtx,
  requireConsoleTenant,
  requireTenantType,
} from '@/lib/console/auth';
import { listClients } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const wrong = requireTenantType(auth, ['AGENCY']);
  if (wrong) return wrong;

  const clients = await listClients(auth);
  return NextResponse.json({ ok: true, clients, tenantId: auth.organizationId });
}
