import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { BreadcrumbJsonLd } from '@/components/json-ld';
import { GUIDE_COMPANIES, GUIDE_ROLES } from '@/lib/interview-guides/catalog';
import { bi } from '@/lib/interview-guides/content';
import { localePath } from '@/i18n/navigation';
import { pageMetadata, SITE_URL } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/interview-guide',
    titleAr: 'أدلة مقابلات الشركات والأدوار | مقابلة',
    titleEn: 'Company & Role Interview Guides | Muqabaleh',
    descAr:
      'أدلة تحضير لمقابلات أشهر شركات وأدوار الشرق الأوسط — أسئلة شائعة، نصائح، وتدرّب مع جيني.',
    descEn:
      'Interview prep guides for top MENA companies and roles — common questions, tips, and free practice with Jeannie.',
  });
}

export default async function InterviewGuideIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale !== 'en';
  const prefix = locale === 'en' ? '/en' : '';

  return (
    <div className="mq-atelier min-h-screen">
      <BreadcrumbJsonLd
        items={[
          {
            name: isAr ? 'الرئيسية' : 'Home',
            url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL,
          },
          {
            name: isAr ? 'أدلة المقابلات' : 'Interview Guides',
            url: `${SITE_URL}${prefix}/interview-guide`,
          },
        ]}
      />
      <JobPortalChrome
        backHref="/"
        backLabel={{ en: 'Home', ar: 'الرئيسية' }}
      />
      <main className="mq-wrap py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <h1 className="mq-display text-3xl font-bold text-white md:text-5xl">
            {isAr ? 'أدلة المقابلات' : 'Interview Guides'}
          </h1>
          <p className="mt-3 max-w-2xl text-white/60">
            {isAr
              ? 'تحضّر قبل التقديم: أسئلة شائعة ونصائح لأشهر الشركات والأدوار في المنطقة.'
              : 'Prepare before you apply: common questions and tips for top MENA companies and roles.'}
          </p>

          <h2 className="mq-display mt-12 text-xl font-bold text-white md:text-2xl">
            {isAr ? 'أدلة الشركات' : 'Company guides'}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {GUIDE_COMPANIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={localePath(`/interview-guide/${c.slug}`, locale)}
                  className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-teal-300/30"
                >
                  <span className="font-bold text-white">{bi(locale, c.name)}</span>
                  <span className="mt-1 block text-sm text-white/45">
                    {bi(locale, c.industry)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mq-display mt-12 text-xl font-bold text-white md:text-2xl">
            {isAr ? 'أدلة الأدوار' : 'Role guides'}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {GUIDE_ROLES.map((r) => (
              <li key={r.slug}>
                <Link
                  href={localePath(`/interview-guide/role/${r.slug}`, locale)}
                  className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-teal-300/30"
                >
                  <span className="font-bold text-white">{bi(locale, r.name)}</span>
                  <span className="mt-1 block text-sm text-white/45">
                    {isAr ? `صعوبة ${r.difficulty}/5` : `Difficulty ${r.difficulty}/5`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <CrystalFooter />
    </div>
  );
}
