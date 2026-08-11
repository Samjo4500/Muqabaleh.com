import { cookies } from 'next/headers';
import { clearDemoPassports } from '@/lib/console/demo-data';
import { demoClearedCookieName } from '@/lib/console/onboarding';

/** If the durable clear cookie is set, purge demo passports on this instance too. */
export async function applyDemoClearedCookie(tenantSlug: string): Promise<boolean> {
  try {
    const jar = await cookies();
    const cleared = jar.get(demoClearedCookieName(tenantSlug))?.value === '1';
    if (cleared) clearDemoPassports(tenantSlug);
    return cleared;
  } catch {
    return false;
  }
}
