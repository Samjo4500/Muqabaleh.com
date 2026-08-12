import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { DeferredMarketingChrome } from '@/components/chrome/DeferredMarketingChrome';
import { fontVariables } from '@/lib/fonts';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

const META: Record<string, { title: string; description: string }> = {
  ar: {
    title: 'مقابلة | Muqabaleh — التدرّب على المقابلات الوظيفية بالذكاء الاصطناعي',
    description:
      'المنصة العربية الأولى للتدرّب على المقابلات الوظيفية بالذكاء الاصطناعي. محاور ذكي يقيّمك بأربعة معايير ويمنحك شهادة موثّقة بشارة QR.',
  },
  en: {
    title: 'Muqabaleh — AI-Powered Job Interview Practice',
    description:
      'The first Arabic platform for AI-powered job interview practice. Get evaluated on 4 criteria and receive a QR-verified certificate.',
  },
};

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = META[locale] || META.ar;
  const ogLocale = locale === 'ar' ? 'ar_SA' : 'en_US';
  const url = `${SITE_URL}${locale === 'ar' ? '' : '/en'}`;

  return {
    title: {
      default: meta.title,
      template: locale === 'ar' ? `%s | مقابلة` : `%s | Muqabaleh`,
    },
    description: meta.description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        'ar-SA': SITE_URL,
        'en-US': `${SITE_URL}/en`,
        'x-default': SITE_URL,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: 'مقابلة | Muqabaleh',
      locale: ogLocale,
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_SA'],
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'مقابلة | Muqabaleh — AI Interview Practice',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/og-image.jpg'],
      site: '@muqabaleh',
    },
    robots: { index: true, follow: true },
    other: {
      'theme-color': '#0a1220',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={fontVariables}>
      <head>
        <meta name="theme-color" content="#0a1220" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Muqabaleh" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-void text-[var(--text-primary)] antialiased">
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
            <DeferredMarketingChrome />
            <Toaster position={dir === 'rtl' ? 'top-left' : 'top-right'} richColors />
          </NextIntlClientProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
