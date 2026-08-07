import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import PageContent from './demo-content';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/demo',
    titleAr: 'تجربة مجانية — تدرّب مع جيني | مقابلة',
    titleEn: 'Free practice — train with Jeannie | Muqabaleh',
    descAr: 'تدرّب على مقابلات العمل مع جيني مجاناً — تقييم فوري بالعربية والإنجليزية.',
    descEn:
      'Practice job interviews free with Jeannie — instant scoring in Arabic and English.',
    keywords:
      locale === 'ar'
        ? ['تجربة مجانية', 'تدريب مقابلات', 'جيني']
        : ['free mock interview', 'Jeannie', 'AI interview practice'],
  });
}

export default async function DemoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getServerSession(authOptions);
  return <PageContent isAuthenticated={Boolean(session?.user)} />;
}
