import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

/** Spec path `/assessment` — routes into the free demo assessment flow. */
export default async function AssessmentPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/demo`);
}
