import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string; token: string }>;
}

/**
 * Ungated guest interviews are disabled.
 * Always send users through registration + pre-qual.
 */
export default async function GuestRoomDisabled({ params }: Props) {
  const { locale } = await params;
  const prequal = locale === 'en' ? '/en/interview/prequal' : '/interview/prequal';
  const dest =
    locale === 'en'
      ? `/en/auth/register?callbackUrl=${encodeURIComponent(prequal)}`
      : `/auth/register?callbackUrl=${encodeURIComponent(prequal)}`;
  redirect(dest);
}
