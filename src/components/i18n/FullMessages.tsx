import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

/**
 * Re-provide the full locale catalog under authenticated / product shells.
 * The [locale] layout ships marketing namespaces only.
 */
export async function FullMessages({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
