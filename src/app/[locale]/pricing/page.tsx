import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

/** Legacy /pricing → landing individual plans (Basic FREE · Jeannie $24.99 · Pro $39.99). */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  redirect(locale === 'en' ? '/en#pricing' : '/#pricing');
}
