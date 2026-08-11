import { ConsoleShell } from '@/components/console/console-shell';
import { DEMO_ORG_SLUG, demoConsoleStore } from '@/lib/console/demo-data';

type Props = {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
};

export default async function ConsoleTenantLayout({ children, params }: Props) {
  const { tenantSlug } = await params;
  const orgName =
    tenantSlug === DEMO_ORG_SLUG ? demoConsoleStore.org.name : tenantSlug;

  return (
    <ConsoleShell tenantSlug={tenantSlug} orgName={orgName}>
      {children}
    </ConsoleShell>
  );
}
