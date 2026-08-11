import { ConsoleShell } from '@/components/console/console-shell';
import { getDemoBundle, isDemoSlug } from '@/lib/console/demo-data';
import type { TenantType } from '@/lib/console/types';

type Props = {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
};

export default async function ConsoleTenantLayout({ children, params }: Props) {
  const { tenantSlug } = await params;
  const demo = isDemoSlug(tenantSlug) ? getDemoBundle(tenantSlug) : null;
  const orgName = demo?.org.name || tenantSlug;
  const tenantType: TenantType = demo?.org.tenantType || 'EMPLOYER';

  return (
    <ConsoleShell tenantSlug={tenantSlug} orgName={orgName} tenantType={tenantType}>
      {children}
    </ConsoleShell>
  );
}
