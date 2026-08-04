import { AdminGate } from './admin-guard';
import { AdminShell } from './admin-shell';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <AdminGate locale={locale}>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}
