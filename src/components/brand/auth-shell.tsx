"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  showBack?: boolean;
}

export function AuthShell({
  children,
  title,
  subtitle,
  className,
  showBack = false,
}: AuthShellProps) {
  const router = useRouter();
  const locale = useLocale();
  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-4 py-12">
      <div className="aurora-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        {showBack && (
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] cursor-pointer"
          >
            <BackArrow size={16} strokeWidth={1.75} />
          </button>
        )}

        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M14 2L26 8v12l-12 6-12-6V8l12-6z"
                stroke="#D4A843"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M14 8l6 3v6l-6 3-6-3v-6l6-3z"
                fill="#D4A843"
                opacity="0.2"
              />
              <circle cx="14" cy="14" r="2" fill="#D4A843" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={cn(
            "glass-card rounded-2xl p-6",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
