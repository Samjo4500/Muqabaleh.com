import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { VacanciesClient } from './vacancies-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr
        ? 'الشواغر المتاحة — مقابلة | Muqabaleh'
        : 'Available Vacancies — Muqabaleh',
    },
    description: isAr
      ? 'تصفّح الشواغر عبر ٢٠ دولة. سجّل كمرشّح أو كشركة وانشر شاغراً — في صفحة واحدة.'
      : 'Browse vacancies across 20 countries. Register as a candidate or as a company and post a vacancy — all on one page.',
  };
}

export default async function JobsPage({ params }: Props) {
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
