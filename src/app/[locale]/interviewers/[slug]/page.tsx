import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { InterviewerProfileClient } from './profile-client';

/* ------------------------------------------------------------------ */
/*  Mock Data Map                                                      */
/* ------------------------------------------------------------------ */

const INTERVIEWER_SLUGS = new Set([
  'huda-al-salem',
  'yasser-al-ghamdi',
  'rana-al-otaibi',
  'sultan-al-dosari',
  'mona-al-qahtani',
  'khalid-al-shahri',
]);

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                             */
/* ------------------------------------------------------------------ */

export default async function InterviewerProfilePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  if (!INTERVIEWER_SLUGS.has(slug)) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-16">
        <InterviewerProfileClient slug={slug} locale={locale} />
      </main>
      <Footer />
    </div>
  );
}
