import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { VacanciesClient } from '../../jobs/vacancies-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr
        ? 'الشواغر — بوابة الوظائف | مقابلة'
        : 'Vacancies — Job Portal | Muqabaleh',
    },
    description: isAr
      ? 'تصفّح الشواغر عبر ٢٠ دولة. سجّل كمرشّح أو اطلب عرضاً لنشر شاغر.'
      : 'Browse vacancies across 20 countries. Register as a candidate or request a demo to post roles.',
  };
}

export default async function PortalJobsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense
      fallback={
        <div className="mq-atelier flex min-h-screen items-center justify-center text-white/50">
          Loading…
        </div>
      }
    >
      <VacanciesClient />
    </Suspense>
  );
}
