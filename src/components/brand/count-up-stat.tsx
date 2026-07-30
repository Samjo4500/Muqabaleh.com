"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CountUpStatProps {
  value: string;
  label: string;
  className?: string;
}

function parseArabicNumeral(str: string): string {
  const arabicNumerals = ["\u0660", "\u0661", "\u0662", "\u0663", "\u0664", "\u0665", "\u0666", "\u0667", "\u0668", "\u0669"];
  return str.replace(/[٠-٩]/g, (d) => String(arabicNumerals.indexOf(d)));
}

function toArabicNumeral(n: number): string {
  const arabicNumerals = ["\u0660", "\u0661", "\u0662", "\u0663", "\u0664", "\u0665", "\u0666", "\u0667", "\u0668", "\u0669"];
  return String(n).replace(/[0-9]/g, (d) => arabicNumerals[Number(d)]);
}

export function CountUpStat({ value, label, className }: CountUpStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const strValue = String(value ?? "");
  const [displayText, setDisplayText] = useState(strValue);

  const isArabic = /[٠-٩]/.test(strValue);
  const prefix = strValue.match(/^[^0-9٠-٩]*/)?.[0] ?? "";
  const suffix = strValue.match(/[^0-9٠-٩]*$/)?.[0] ?? "";
  const numericPart = strValue.slice(prefix.length, suffix.length ? -suffix.length : undefined);
  const targetNum = parseInt(
    isArabic ? parseArabicNumeral(numericPart) : numericPart,
    10
  );
  const hasCommas = numericPart.includes(",") || numericPart.includes("\u066C");

  const formatNum = useCallback(
    (n: number): string => {
      const formatted = hasCommas
        ? n.toLocaleString(isArabic ? "ar-SA" : "en-US")
        : String(n);
      return `${prefix}${isArabic ? toArabicNumeral(Number(formatted.replace(/,/g, ""))) : formatted}${suffix}`;
    },
    [prefix, suffix, isArabic, hasCommas]
  );

  useEffect(() => {
    if (hasAnimated || isNaN(targetNum)) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasAnimated(true);
        observer.disconnect();

        const duration = 2000;
        const startTime = performance.now();

        const step = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * targetNum);
          setDisplayText(formatNum(current));

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };

        requestAnimationFrame(step);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, targetNum, formatNum]);

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <div className="font-display text-4xl font-bold text-gold md:text-5xl">
        {displayText}
      </div>
      <div className="mt-2 text-sm text-[var(--text-muted)]">{label}</div>
    </div>
  );
}
