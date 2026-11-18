/**
 * Real Postgres (PGlite, in-process) built from the repo's actual Prisma schema,
 * loaded through a SQL adapter that mimics the Prisma surface `grantForCapture`
 * uses. Constraints, the unique index and transaction rollback are all real.
 */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { GrantDb } from '../../src/lib/paypal/grant';

export interface SqlClient {
  query(sql: string, params?: unknown[]): Promise<{ rows: any[] }>;
}

export function makeGrantDb(raw: PGlite): GrantDb {
  const make = (client: SqlClient, tx?: GrantDb['$transaction']): GrantDb => ({
    // grantPlan() writes through the transaction client when one is supplied.
    user: {
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const sets: string[] = [];
        const vals: unknown[] = [];
        let i = 1;
        for (const [k, v] of Object.entries(data)) {
          // Prisma's { increment: n } — translate it, or postgres sees an object.
          if (v && typeof v === 'object' && 'increment' in (v as Record<string, unknown>)) {
            sets.push(`"${k}" = COALESCE("${k}", 0) + $${i++}`);
            vals.push((v as { increment: number }).increment);
          } else {
            sets.push(`"${k}" = $${i++}`);
            vals.push(v);
          }
        }
        sets.push('"updatedAt" = now()');
        vals.push(where.id);
        const res = await client.query(
          `UPDATE "User" SET ${sets.join(', ')} WHERE id = $${i} RETURNING id`,
          vals,
        );
        // Prisma throws P2025 when the target row does not exist; match that so
        // a missing user can never look like a successful grant.
        if (res.rows.length === 0) {
          const err = new Error('Record to update not found') as Error & { code?: string };
          err.code = 'P2025';
          throw err;
        }
        return res.rows[0];
      },
    },
    paypalOrder: {
      findUnique: async ({ where }) => {
        // Prisma allows any unique column; mirror that instead of assuming ref.
        const keys = Object.keys(where as Record<string, unknown>);
        const conds = keys.map((k, n) => `"${k}" = $${n + 1}`).join(' AND ');
        const vals = keys.map((k) => (where as Record<string, unknown>)[k]);
        const r = await client.query(`SELECT * FROM "PaypalOrder" WHERE ${conds}`, vals);
        return (r.rows[0] as any) ?? null;
      },
      findMany: async ({ where, orderBy, take }: any) => {
        const conds: string[] = [];
        const vals: unknown[] = [];
        let i = 1;
        if (where?.status?.in) {
          conds.push(`status = ANY($${i++})`);
          vals.push(where.status.in);
        }
        if (where?.grantedAt === null) conds.push('"grantedAt" IS NULL');
        if (where?.createdAt?.lt) {
          conds.push(`"createdAt" < $${i++}`);
          vals.push(where.createdAt.lt);
        }
        const sql =
          `SELECT * FROM "PaypalOrder"` +
          (conds.length ? ` WHERE ${conds.join(' AND ')}` : '') +
          (orderBy?.createdAt ? ` ORDER BY "createdAt" ${orderBy.createdAt === 'desc' ? 'DESC' : 'ASC'}` : '') +
          (take ? ` LIMIT ${Number(take)}` : '');
        const r = await client.query(sql, vals);
        return r.rows as any;
      },
      updateMany: async ({ where, data }) => {
        const sets: string[] = [];
        const vals: unknown[] = [];
        let i = 1;
        for (const [k, v] of Object.entries(data)) {
          sets.push(`"${k}" = $${i++}`);
          vals.push(v);
        }
        sets.push('"updatedAt" = now()');
        const conds = ['ref = $' + i++];
        vals.push(where.ref);
        if ('grantedAt' in where && (where as any).grantedAt === null) {
          conds.push('"grantedAt" IS NULL');
        }
        if ((where as any).refundedAt === null) conds.push('"refundedAt" IS NULL');
        const sql = `UPDATE "PaypalOrder" SET ${sets.join(', ')} WHERE ${conds.join(' AND ')} RETURNING *`;
        const res = await client.query(sql, vals);
        return { count: res.rows.length };
      },
      update: async ({ where, data }) => {
        const sets: string[] = [];
        const vals: unknown[] = [];
        let i = 1;
        for (const [k, v] of Object.entries(data)) {
          sets.push(`"${k}" = $${i++}`);
          vals.push(v);
        }
        sets.push('"updatedAt" = now()');
        vals.push(where.ref);
        const res = await client.query(
          `UPDATE "PaypalOrder" SET ${sets.join(', ')} WHERE ref = $${i} RETURNING *`,
          vals,
        );
        return res.rows[0];
      },
    },
    webhookEvent: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const now = new Date();
        const payload = { receivedAt: now, processedAt: null, ...data };
        const cols = Object.keys(payload);
        try {
          await client.query(
            `INSERT INTO "WebhookEvent" (${cols.map((c) => `"${c}"`).join(', ')})
             VALUES (${cols.map((_, n) => `$${n + 1}`).join(', ')})`,
            Object.values(payload),
          );
        } catch (e: any) {
          // Prisma maps 23505 to P2002; the code path must see the same thing.
          const err = new Error('Unique constraint failed') as Error & { code?: string };
          err.code = 'P2002';
          throw err;
        }
        return {};
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const keys = Object.keys(data);
        await client.query(
          `UPDATE "WebhookEvent" SET ${keys.map((k, n) => `"${k}" = $${n + 1}`).join(', ')} WHERE id = $${keys.length + 1}`,
          [...Object.values(data), where.id],
        );
        return {};
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const r = await client.query('SELECT * FROM "WebhookEvent" WHERE id = $1', [where.id]);
        return (r.rows[0] as any) ?? null;
      },
    },
    payment: {
      create: async ({ data }) => {
        // Prisma generates cuid()/uuid() client-side; the DB default is absent.
        const now = new Date();
        const payload = {
          id: `pay_${Math.random().toString(36).slice(2, 12)}`,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        const cols = Object.keys(payload);
        const vals = Object.values(payload);
        const ph = cols.map((_, n) => `$${n + 1}`).join(', ');
        const sql = `INSERT INTO "Payment" (${cols.map((c) => `"${c}"`).join(', ')})
                     VALUES (${ph}) RETURNING id`;
        try {
          if (process.env.DEBUG_SQL) console.log('[harness] Payment INSERT', cols.join(','), vals.map(v => typeof v + ':' + String(v)).join(' | '));
          const res = await client.query(sql, vals);
          return { id: res.rows[0].id as string };
        } catch (e: any) {
          // Surfacing P2002 the way Prisma does, so the code path is realistic.
          if (String(e?.message ?? '').includes('duplicate key')) {
            const err = new Error('Unique constraint failed') as Error & { code?: string };
            err.code = 'P2002';
            throw err;
          }
          throw e;
        }
      },
      findUnique: async ({ where }) => {
        const keys = Object.keys(where as Record<string, unknown>);
        const conds = keys.map((k, n) => `"${k}" = $${n + 1}`).join(' AND ');
        const vals = keys.map((k) => (where as Record<string, unknown>)[k]);
        const r = await client.query(`SELECT * FROM "Payment" WHERE ${conds}`, vals);
        return (r.rows[0] as any) ?? null;
      },
    },
    $transaction: tx ?? (async <T>(fn: (t: GrantDb) => Promise<T>) =>
      (await raw.transaction(async (t: any) => fn(make(t)))) as T),
  });
  return make(raw);
}

let lastFake: FakePayPal | null = null;
let lastDb: GrantDb | null = null;
export const getFake = () => lastFake;
export const getDb = () => lastDb as GrantDb;

export async function boot() {
  process.env.PAYPAL_MERCHANT_ID = 'MERCHANT_TEST';
  process.env.PAYPAL_CLIENT_ID = 'test-client-id';
  process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret';
  process.env.PAYPAL_MODE = 'sandbox';
  // src/lib/db.ts builds a PrismaClient at import time. It is never connected in
  // these tests (the DB calls are injected), but it needs the variable to exist.
  process.env.DATABASE_URL ||= 'postgresql://u:p@127.0.0.1:5432/unused';
  process.env.DIRECT_URL ||= process.env.DATABASE_URL;

  const raw = new PGlite();
  const schema = readFileSync(join(process.cwd(), 'tests/paypal/schema.sql'), 'utf8');
  await raw.exec(schema);
  lastFake = new FakePayPal();
  installFetch(lastFake);
  const db = makeGrantDb(raw);
  lastDb = db;
  return { raw, db };
}

export async function seedUser(raw: PGlite, id = 'user_1') {
  await raw.query(
    `INSERT INTO "User" (id, email, "passwordHash", tier, "sessionsLeft", "cvStudioEnabled", "coverLetterAiEnabled", "createdAt", "updatedAt")
     VALUES ($1, $2, 'x', 'FREE', 1, false, false, now(), now())`,
    [id, `${id}@example.com`],
  );
}

export async function seedOrder(
  raw: PGlite,
  over: Partial<{
    ref: string;
    userId: string;
    planCode: string;
    amountCents: number;
    currency: string;
    status: string;
    paypalOrderId: string | null;
    grantedAt: Date | null;
  }> = {},
) {
  const o = {
    ref: 'mo_test',
    userId: 'user_1',
    planCode: 'JEANNIE',
    amountCents: 1499,
    currency: 'USD',
    status: 'APPROVED',
    paypalOrderId: 'PPO-1',
    grantedAt: null as Date | null,
    ...over,
  };
  await raw.query(
    `INSERT INTO "PaypalOrder" (id, ref, "userId", "planCode", "amountCents", currency, "paypalOrderId", status, "grantedAt", "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now(), now())`,
    [
      `po_${o.ref}`,
      o.ref,
      o.userId,
      o.planCode,
      o.amountCents,
      o.currency,
      o.paypalOrderId,
      o.status,
      o.grantedAt,
    ],
  );
  return o;
}

export function facts(over: Record<string, unknown> = {}) {
  return {
    paypalOrderId: 'PPO-1',
    captureId: 'CAP-1',
    captureStatus: 'COMPLETED',
    amountCents: 1499,
    currency: 'USD',
    merchantId: 'MERCHANT_TEST',
    payerId: 'PAYER1',
    ...over,
  } as any;
}


/** Fake PayPal REST API: enough of the real shapes for the capture flow. */
export class FakePayPal {
  orders = new Map<
    string,
    {
      id: string;
      status: 'CREATED' | 'APPROVED' | 'COMPLETED' | 'VOIDED';
      amount: { currency_code: string; value: string };
      merchantId: string;
      capture: { id: string; status: string; value: string; currency: string } | null;
      captureAttempts: number;
    }
  >();
  calls: { method: string; path: string; requestId?: string }[] = [];
  refunds: { captureId: string; note: string }[] = [];
  overrideAmount: { value: string; currency: string } | null = null;
  captureStatus = 'COMPLETED';
  private seq = 0;

  private next(prefix: string) {
    this.seq += 1;
    return `${prefix}${String(this.seq).padStart(6, '0')}`;
  }

  handler = async (url: string, init?: RequestInit): Promise<Response> => {
    const path = new URL(url).pathname;
    const method = (init?.method ?? 'GET').toUpperCase();
    const requestId = new Headers(init?.headers ?? {}).get('paypal-request-id') ?? undefined;
    this.calls.push({ method, path, requestId });
    const json = (b: unknown, s = 200) =>
      new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

    if (path === '/v1/oauth2/token') return json({ access_token: 'fake-token', expires_in: 3600 });

    const cap = path.match(/^\/v2\/checkout\/orders\/([^/]+)\/capture$/);
    if (cap && method === 'POST') {
      const order = this.orders.get(cap[1]);
      if (!order) return json({ name: 'INVALID_RESOURCE_ID' }, 404);
      order.captureAttempts += 1;
      if (order.capture) {
        return json(
          { name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'ORDER_ALREADY_CAPTURED' }] },
          422,
        );
      }
      if (order.status !== 'APPROVED') {
        return json({ name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'ORDER_NOT_APPROVED' }] }, 422);
      }
      const value = this.overrideAmount?.value ?? order.amount.value;
      const currency = this.overrideAmount?.currency ?? order.amount.currency_code;
      order.capture = { id: this.next('CAP'), status: this.captureStatus, value, currency };
      if (this.captureStatus === 'COMPLETED') order.status = 'COMPLETED';
      return json(this.payload(order), 201);
    }

    const refund = path.match(/^\/v2\/payments\/captures\/([^/]+)\/refund$/);
    if (refund && method === 'POST') {
      const body = JSON.parse(String(init?.body ?? '{}'));
      this.refunds.push({ captureId: refund[1], note: body.note_to_payer ?? '' });
      return json({ id: this.next('REF'), status: 'COMPLETED' }, 201);
    }

    const get = path.match(/^\/v2\/checkout\/orders\/([^/]+)$/);
    if (get && method === 'GET') {
      const order = this.orders.get(get[1]);
      if (!order) return json({ name: 'INVALID_RESOURCE_ID' }, 404);
      return json(this.payload(order));
    }

    return json({ name: 'NOT_IMPLEMENTED', path, method }, 404);
  };

  private payload(o: {
    id: string;
    status: string;
    amount: { currency_code: string; value: string };
    merchantId: string;
    capture: { id: string; status: string; value: string; currency: string } | null;
  }) {
    return {
      id: o.id,
      status: o.status,
      payer: o.capture ? { payer_id: 'PAYER1' } : undefined,
      purchase_units: [
        {
          reference_id: 'JEANNIE',
          payee: { merchant_id: o.merchantId },
          payments: o.capture
            ? {
                captures: [
                  {
                    id: o.capture.id,
                    status: o.capture.status,
                    amount: { currency_code: o.capture.currency, value: o.capture.value },
                    payee: { merchant_id: o.merchantId },
                  },
                ],
              }
            : undefined,
        },
      ],
    };
  }
}

let current: FakePayPal | null = null;
let fetchInstalled = false;
function installFetch(fake: FakePayPal) {
  current = fake;
  if (fetchInstalled) return;
  fetchInstalled = true;
  const realFetch = globalThis.fetch;
  globalThis.fetch = ((input: any, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input?.url ?? '');
    if (url.includes('paypal.com') && current) return current.handler(url, init);
    return realFetch(input, init);
  }) as typeof fetch;
}
