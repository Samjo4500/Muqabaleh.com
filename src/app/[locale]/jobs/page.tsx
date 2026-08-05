import { redirect } from 'next/navigation';
import { localePath } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Legacy /jobs → Job Portal vacancies board. */
export default async function JobsRedirect({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }
  const query = qs.toString();
  redirect(localePath(query ? `/portal/jobs?${query}` : '/portal/jobs', locale));
}
