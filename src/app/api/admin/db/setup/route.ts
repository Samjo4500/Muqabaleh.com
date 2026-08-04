import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

/**
 * One-shot Super Admin endpoint to apply the Super Admin migration SQL
 * when `prisma migrate deploy` cannot run in the build environment.
 */
export async function POST() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const sqlPath = join(
      process.cwd(),
      'prisma/migrations/20260804163000_super_admin_control_panel/migration.sql',
    );
    const sql = readFileSync(sqlPath, 'utf8');
    // Split on semicolons; keep DO $$ blocks intact by naive split then filter
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    const results: { ok: boolean; preview: string; error?: string }[] = [];
    for (const statement of statements) {
      const preview = statement.slice(0, 80).replace(/\s+/g, ' ');
      try {
        await db.$executeRawUnsafe(statement.endsWith(';') ? statement : `${statement};`);
        results.push({ ok: true, preview });
      } catch (err) {
        results.push({ ok: false, preview, error: String(err) });
      }
    }

    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'SECURITY',
        entity: 'db_setup',
        details: {
          applied: results.filter((r) => r.ok).length,
          failed: results.filter((r) => !r.ok).length,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      applied: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (e) {
    console.error('[admin db setup]', e);
    return NextResponse.json({ error: 'Setup failed', detail: String(e) }, { status: 500 });
  }
}
