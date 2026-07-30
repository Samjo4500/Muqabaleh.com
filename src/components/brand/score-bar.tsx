"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  goldTicks?: boolean;
  className?: string;
}

export function ScoreBar({
  label,
  value,
  max = 100,
  goldTicks = true,
  className,
}: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </span>
        <span className="text-sm font-bold text-gold">{value}</span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        {goldTicks && (
          <div className="absolute inset-0 flex justify-between px-0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="h-full w-px bg-white/10"
              />
            ))}
          </div>
        )}
        <motion.div
          className="absolute inset-y-0 start-0 rounded-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        />
      </div>
    </div>
  );
}
