import { setRequestLocale } from 'next-intl/server';
import { JobsBoardClient } from './jobs-board-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function JobsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JobsBoardClient />;
}
