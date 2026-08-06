import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

/** Legacy /pricing → landing plans (prices concealed; demo/quote CTAs). */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  redirect(locale === 'en' ? '/en#pricing' : '/#pricing');
}
