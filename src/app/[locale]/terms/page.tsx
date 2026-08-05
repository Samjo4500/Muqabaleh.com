import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/terms',
    titleAr: 'الشروط — مقابلة',
    titleEn: 'Terms — Muqabaleh',
    descAr: 'شروط استخدام منصة مقابلة للتدرّب على المقابلات الوظيفية.',
    descEn: 'Terms of use for the Muqabaleh interview practice platform.',
  });
}

export default async function TermsPage({ params }: Props) {
  const t = await getTranslations('legal');

  const paragraphs: string[] = Array.from({ length: 15 }, (_, i) =>
    t(`termsP${i + 1}`),
  );

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold md:text-4xl">
              <span className="gold-gradient-text">{t('termsTitle')}</span>
            </h1>
            <p className="mt-4 text-sm text-[var(--text-faint)]">{t('lastUpdated')}</p>

            <div className="mt-10 space-y-6">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-loose text-[var(--text-muted)]">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
