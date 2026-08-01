import { redirect } from 'next/navigation';

// Next.js 16 deprecated middleware — root page.tsx ensures / always works
// Redirects to Arabic (default locale) which serves src/app/[locale]/page.tsx
export default function RootPage() {
  redirect('/ar');
}
