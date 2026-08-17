'use client';

import { useState, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Gate2Practice } from './Gate2Practice';
import { readNurture } from './gate-storage';

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
  role?: string;
  company?: string;
  jobId?: string;
  roleId?: string;
  companyId?: string;
};

export function PracticeGateLink({
  href,
  className,
  children,
  role,
  company,
  jobId,
  roleId,
  companyId,
}: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href={href}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const stored = readNurture();
          if (stored.practiceReady && stored.email) {
            router.push(href);
            return;
          }
          setOpen(true);
        }}
      >
        {children}
      </a>
      <Gate2Practice
        open={open}
        isAr={isAr}
        locale={locale}
        href={href}
        role={role}
        company={company}
        jobId={jobId}
        roleId={roleId || jobId}
        companyId={companyId}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
