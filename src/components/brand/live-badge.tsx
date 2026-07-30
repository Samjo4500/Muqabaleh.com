"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  label?: string;
  className?: string;
}

export function LiveBadge({ label, className }: LiveBadgeProps) {
  const t = useTranslations("brand");
  const displayLabel = label ?? t("live");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-emerald rounded-full bg-emerald opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald" />
      </span>
      <span className="text-xs font-bold tracking-wide text-emerald">
        {displayLabel}
      </span>
    </div>
  );
}
