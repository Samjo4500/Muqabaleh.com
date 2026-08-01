"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface QrCardProps {
  verificationId: string;
  className?: string;
}

const QR_PATTERN: number[] = [
  1,1,1,0,1,0,1,1,1,
  1,0,1,1,0,1,1,0,1,
  1,1,1,0,0,1,1,1,1,
  0,0,0,1,1,0,0,0,1,
  1,0,1,0,1,0,1,0,0,
  0,0,1,1,0,0,1,1,0,
  1,1,1,0,1,1,0,0,1,
  1,0,1,1,0,1,0,1,1,
  1,1,1,0,1,0,1,1,1,
];

function QrPlaceholder() {
  return (
    <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="grid grid-cols-9 gap-[3px]">
        {QR_PATTERN.map((filled, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const isCorner =
            (row < 3 && col < 3) ||
            (row < 3 && col > 5) ||
            (row > 5 && col < 3);
          return (
            <div
              key={i}
              className={cn(
                "h-[3px] w-[3px] rounded-[0.5px]",
                isCorner
                  ? "bg-gold"
                  : filled
                    ? "bg-white/40"
                    : "bg-white/[0.06]"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

export function QrCard({ verificationId, className }: QrCardProps) {
  const t = useTranslations("brand");
  const verifyUrl = `${t("verifyUrl")}${verificationId}`;

  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <QrPlaceholder />
      <p className="mt-4 text-center font-mono text-xs text-[var(--text-muted)]">
        {verifyUrl}
      </p>
    </div>
  );
}
