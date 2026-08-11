import { redirect } from 'next/navigation';
import { DEMO_ORG_SLUG } from '@/lib/console/demo-data';
import { localePath } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

/** Phase 1 preview entry → seeded Employer demo tenant */
export default async function ConsoleIndexPage({ params }: Props) {
  const { locale } = await params;
  redirect(localePath(`/console/${DEMO_ORG_SLUG}`, locale));
}
