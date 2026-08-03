'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { ShieldX } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ADMIN_EMAIL = 'samjo4500@gmail.com';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const locale = useLocale();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
      </div>
    );
  }

  const isAuthorized = session?.user?.email === ADMIN_EMAIL;

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
              <ShieldX size={28} className="text-red-400" strokeWidth={1.75} />
            </div>
            <Image
              src="/images/logos/v2-balanced-a-T.webp"
              alt="Muqabaleh Admin"
              width={120}
              height={34}
              className="h-8 w-auto opacity-70"
            />
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              {locale === 'ar' ? 'غير مصرح' : 'Not Authorized'}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {locale === 'ar'
                ? 'ليس لديك صلاحية الوصول إلى لوحة الإدارة'
                : 'You do not have permission to access the admin panel'}
            </p>
          </div>
          <Link
            href={`/${locale}/auth/signin`}
            className="btn-gold inline-flex items-center justify-center gap-2 text-sm"
          >
            {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
