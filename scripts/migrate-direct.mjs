#!/usr/bin/env node
/**
 * Run prisma migrate deploy over DIRECT_URL (port 5432).
 * Never point this at the 6543 transaction pooler.
 */
import { spawnSync } from 'node:child_process';

const direct = (process.env.DIRECT_URL || '').trim();
if (!direct) {
  console.error(
    'DIRECT_URL is required. Use the Supabase direct host on port 5432, not pooler:6543.',
  );
  process.exit(1);
}
if (/:(6543)\b/.test(direct)) {
  console.error(
    'DIRECT_URL is the transaction pooler (port 6543). Migrations hang there. Use port 5432.',
  );
  process.exit(1);
}

const result = spawnSync(
  'npx',
  ['prisma', 'migrate', 'deploy', '--schema=./prisma/schema.prisma'],
  {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: direct, DIRECT_URL: direct },
  },
);
process.exit(result.status ?? 1);
