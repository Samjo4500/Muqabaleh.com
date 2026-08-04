import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const target = "/admin/interviewers";
  redirect(locale === 'ar' ? target : `/${locale}${target}`);
}
