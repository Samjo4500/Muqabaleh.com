"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type VerifiedBadgeSize = "sm" | "md" | "lg";

interface VerifiedBadgeProps {
  size?: VerifiedBadgeSize;
  className?: string;
}

const sizeMap: Record<VerifiedBadgeSize, { icon: number; text: string; gap: string }> = {
  sm: { icon: 14, text: "text-xs", gap: "gap-1" },
  md: { icon: 20, text: "text-sm", gap: "gap-1.5" },
  lg: { icon: 24, text: "text-base", gap: "gap-2" },
};

export function VerifiedBadge({ size = "md", className }: VerifiedBadgeProps) {
  const t = useTranslations("brand");
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-cyan/10 px-2.5 py-1 ring-1 ring-cyan/20",
        s.gap,
        className
      )}
    >
      <ShieldCheck
        size={s.icon}
        strokeWidth={1.75}
        className="text-cyan"
      />
      <span className={cn("font-semibold text-cyan", s.text)}>
        {t("verified")}
      </span>
    </div>
  );
}
