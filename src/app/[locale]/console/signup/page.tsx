import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Employer signup entry — routes to B2B register / demo request.
 * Keeps /console/signup?type=employer deep-links from marketing pages.
 */
export default async function ConsoleSignupPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const type = Array.isArray(sp.type) ? sp.type[0] : sp.type;

  const dest =
    type === 'employer'
      ? locale === 'en'
        ? '/en/auth/register?accountType=B2B&from=employers'
        : '/auth/register?accountType=B2B&from=employers'
      : locale === 'en'
        ? '/en/request-demo?from=console-signup'
        : '/request-demo?from=console-signup';

  redirect(dest);
}
