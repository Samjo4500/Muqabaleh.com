import { redirect } from 'next/navigation';

// Redirect old slug-based URLs to the new ID-based interviewer profile
// This handles any links that still point to /interviewers/[slug]
export default async function InterviewerSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { locale, slug } = await params;
  // Map known slugs to mock interviewer IDs
  const slugToId: Record<string, string> = {
    'huda-al-salem': 'int-001',
    'yasser-al-ghamdi': 'int-002',
    'rana-al-otaibi': 'int-003',
    'sultan-al-dosari': 'int-004',
    'mona-al-qahtani': 'int-005',
    'khalid-al-shahri': 'int-006',
  };
  const id = slugToId[slug] || slug;
  redirect(`/${locale}/interviewer/${id}`);
}
