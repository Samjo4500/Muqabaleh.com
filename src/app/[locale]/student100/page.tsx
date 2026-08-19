import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { STUDENT100_CAP, STUDENT100_START_AT } from '@/lib/student100/constants';
import Student100Content from './student100-content';

type Props = {
  params: Promise<{ locale: string }>;
};

/** Inventory is fetched on the client so production builds do not query Postgres. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/student100',
    titleAr: 'باقة مقابلة للطلاب — أول 100 — مقابلة',
    titleEn: 'Student Interview Pack — first 100 — Muqabaleh',
    descAr:
      'أول 100 طالب أو خريج حديث مؤهل في المنطقة يحصلون على 3 مقابلات تجريبية بالذكاء الاصطناعي صالحة 30 يوماً.',
    descEn:
      'The first 100 verified MENA students and recent graduates get 3 AI mock interviews, valid for 30 days.',
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Student100Content
      initial={{
        available: false,
        open: true,
        startAt: STUDENT100_START_AT.toISOString(),
        cap: STUDENT100_CAP,
        reserved: 0,
        remaining: STUDENT100_CAP,
        soldOut: false,
      }}
    />
  );
}
