import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'مقابلة | Muqabaleh',
  description: 'المنصة العربية الأولى للتدرّب على المقابلات الوظيفية بالذكاء الاصطناعي',
  icons: {
    icon: '/images/logos/concept-m1-glasscapsule-T.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
