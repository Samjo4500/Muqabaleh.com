import 'server-only';
import { db } from '@/lib/db';

/**
 * One place where the PayPal modules get their database client.
 *
 * Production: the singleton Prisma client. Tests: a client backed by a real
 * in-process Postgres, so constraints, transactions and rollbacks are genuine
 * rather than mocked.
 */
let override: unknown = undefined;

export const setPayPalDb = (client: unknown) => {
  override = client;
};

export const paypalDb = <T = typeof db>(): T => (override ?? db) as T;
