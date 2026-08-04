"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  sub?: string;
  cta?: string;
  ctaHref?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  sub,
  cta,
  ctaHref,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 rounded-2xl bg-white/5 p-4 text-[var(--text-faint)]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      {sub && (
        <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
          {sub}
        </p>
      )}
      {cta && ctaHref && (
        <Link
          href={ctaHref}
          className="btn-gold mt-6 inline-block text-sm"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}
