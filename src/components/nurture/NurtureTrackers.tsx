'use client';

import { useEffect } from 'react';
import { collectNurture } from './gate-storage';

export function JobsBrowseTracker() {
  useEffect(() => {
    collectNurture('jobs_browse', { path: '/jobs' });
  }, []);
  return null;
}

export function JobClickTracker({
  role,
  company,
  jobId,
}: {
  role?: string;
  company?: string;
  jobId?: string;
}) {
  useEffect(() => {
    collectNurture('job_click', { role, company, jobId });
  }, [role, company, jobId]);
  return null;
}

export function ApplyTrackLink({
  href,
  className,
  children,
  role,
  company,
  jobId,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  role?: string;
  company?: string;
  jobId?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => collectNurture('apply_click', { role, company, jobId })}
    >
      {children}
    </a>
  );
}
