import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { InterviewersBoardClient } from './interviewers-board-client';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr ? 'المحاورون — مقابلة | Muqabaleh' : 'Interviewers — Muqabaleh',
    },
    description: isAr
      ? 'احجز جلسة مع محاور بشري معتمد من مجال تخصصك — عربية وإنجليزية، حجز بالساعة.'
      : 'Book a live session with a certified human interviewer from your field — Arabic & English, hourly booking.',
  };
}

export default async function InterviewersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <InterviewersBoardClient />;
}
