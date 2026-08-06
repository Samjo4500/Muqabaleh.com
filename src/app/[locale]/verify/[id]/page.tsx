import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { VerifyClient } from '../verify-client';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: { absolute: `Verify ${id} — Muqabaleh` },
    robots: { index: false, follow: false },
  };
}

export default async function VerifyByIdPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <VerifyClient initialId={id} />;
}
