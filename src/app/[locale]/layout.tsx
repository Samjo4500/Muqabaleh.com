import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { PWAInstallPrompt } from '@/components/pwa/InstallPrompt';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh-com.vercel.app';

const META: Record<string, { title: string; description: string }> = {
  ar: {
    title: 'مقابلة | Muqabaleh — التدرّب على المقابلات الوظيفية بالذكاء الاصطناعي',
    description: 'المنصة العربية الأولى للتدرّب على المقابلات الوظيفية بالذكاء الاصطناعي. محاور ذكي يقيّمك بأربعة معايير ويمنحك شهادة موثّقة بشارة QR.',
  },
  en: {
    title: 'Muqabaleh — AI-Powered Job Interview Practice',
    description: 'The first Arabic platform for AI-powered job interview practice. Get evaluated on 4 criteria and receive a QR-verified certificate.',
  },
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = META[locale] || META.ar;
  const ogLocale = locale === 'ar' ? 'ar_SA' : 'en_US';
  const url = `${SITE_URL}${locale === 'ar' ? '' : '/en'}`;

  return {
    title: {
      default: meta.title,
      template: `%s | مقابلة`,
    },
    description: meta.description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        'ar-SA': SITE_URL,
        'en-US': `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: 'مقابلة | Muqabaleh',
      locale: ogLocale,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
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
      images: ['/og-image.png'],
    },
    other: {
      'theme-color': '#D4A853',
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
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const displayFont = locale === 'ar' ? 'Cairo' : 'Space Grotesk';
  const bodyFont = locale === 'ar' ? 'Tajawal' : 'Inter';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#D4A853" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Muqabaleh" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${dir === 'rtl' ? 'font-cairo' : 'font-grotesk'} min-h-screen bg-void text-[var(--text-primary)] antialiased`}
        style={{ fontFamily: `"${displayFont}", "${bodyFont}", sans-serif` }}
      >
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
            <MobileTabBar />
            <PWAInstallPrompt />
          </NextIntlClientProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
