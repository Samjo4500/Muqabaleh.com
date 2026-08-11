import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { localePath } from '@/i18n/navigation';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/legal/opt-out',
    titleAr: 'طلب إزالة إعلانات الوظائف | مقابلة',
    titleEn: 'Job listing opt-out | Muqabaleh',
    descAr:
      'اطلب إزالة إعلانات شركتك من لوحة وظائف مقابلة. نعالج طلبات الإزالة خلال ٤٨ ساعة.',
    descEn:
      'Request removal of your company listings from the Muqabaleh job board. We honor opt-out requests within 48 hours.',
  });
}

export default async function OptOutPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return (
    <div className="mq-atelier min-h-screen">
      <JobPortalChrome backHref="/jobs" backLabel={{ en: 'Jobs', ar: 'الوظائف' }} />
      <main className="mq-wrap mx-auto max-w-2xl py-16 md:py-24">
        <p className="mq-kicker mb-3">{isAr ? 'قانوني' : 'Legal'}</p>
        <h1 className="mq-display text-3xl font-bold text-white md:text-4xl">
          {isAr ? 'طلب إزالة إعلانات الوظائف' : 'Job listing opt-out'}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/60">
          {isAr
            ? 'إذا كانت شركتك مدرجة عبر واجهات ATS العامة وتريد إزالة إعلاناتها من مقابلة، راسلنا. نلتزم بمعالجة طلبات الإزالة خلال ٤٨ ساعة.'
            : 'If your company is listed via public ATS feeds and you want those listings removed from Muqabaleh, email us. We honor removal requests within 48 hours.'}
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6">
          <p className="text-sm font-semibold text-white/80">
            {isAr ? 'البريد الإلكتروني' : 'Email'}
          </p>
          <a
            href="mailto:contact@muqabaleh.com?subject=Job%20listing%20opt-out"
            className="mt-2 inline-block text-lg font-bold text-teal-300 underline-offset-4 hover:underline"
          >
            contact@muqabaleh.com
          </a>
          <p className="mt-4 text-sm text-white/45">
            {isAr
              ? 'اذكر اسم الشركة، رابط الوظائف، وأي slug لواجهة ATS إن وُجد.'
              : 'Include company name, careers URL, and ATS slug if known.'}
          </p>
        </div>

        <Link
          href={localePath('/jobs', locale)}
          className="mq-btn mq-btn-ghost mt-8 inline-flex min-h-[44px] items-center px-5 text-sm font-bold"
        >
          {isAr ? 'العودة للوظائف' : 'Back to jobs'}
        </Link>
      </main>
    </div>
  );
}
