import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { DeferredMarketingChrome } from '@/components/chrome/DeferredMarketingChrome';
import { CookieConsentBanner } from '@/components/privacy/CookieConsentBanner';
import { ConditionalAnalytics } from '@/components/analytics/ConditionalAnalytics';
import { fontVariablesFor } from '@/lib/fonts';
import { pickPublicMessages } from '@/lib/i18n/public-messages';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/json-ld';

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
      title:
        locale === 'ar'
          ? 'Muqabaleh | تدرّب على مقابلات العمل بالذكاء الاصطناعي'
          : 'Muqabaleh | Practice job interviews with AI',
      description:
        'Practice your job interview in Arabic or English. Get a verified passport. Apply with confidence.',
      url,
      siteName: 'مقابلة | Muqabaleh',
      locale: ogLocale,
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_SA'],
      type: 'website',
      images: [
        {
          url: '/og-passport.jpg',
          width: 1200,
          height: 630,
          alt: 'مقابلة | Muqabaleh — AI Interview Practice',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title:
        locale === 'ar'
          ? 'Muqabaleh | تدرّب على مقابلات العمل بالذكاء الاصطناعي'
          : 'Muqabaleh | Practice job interviews with AI',
      description:
        'Practice your job interview in Arabic or English. Get a verified passport. Apply with confidence.',
      images: ['/og-passport.jpg'],
      site: '@muqabaleh',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
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
  const messages = pickPublicMessages(await getMessages());
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={fontVariablesFor(locale)}>
      <head>
        <meta name="theme-color" content="#0a1220" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Muqabaleh" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <OrganizationJsonLd />
        <WebSiteJsonLd locale={locale} />
      </head>
      <body className="min-h-screen bg-void text-[var(--text-primary)] antialiased">
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
            <DeferredMarketingChrome />
            <ConditionalAnalytics />
            <Toaster position={dir === 'rtl' ? 'top-left' : 'top-right'} richColors />
          </NextIntlClientProvider>
        </Providers>
        {/* Outside SessionProvider so auth/CSP client errors cannot hide consent UI */}
        <CookieConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
