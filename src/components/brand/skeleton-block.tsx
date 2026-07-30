import { cn } from "@/lib/utils";

interface SkeletonBlockProps {
  lines?: number;
  className?: string;
}

export function SkeletonBlock({ lines = 3, className }: SkeletonBlockProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-4", className)}>
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1;
        return (
          <div
            key={i}
            className={cn(
              "h-4 animate-pulse rounded-md bg-white/[0.06]",
              isLast ? "w-3/5" : "w-full",
              i > 0 && "mt-3"
            )}
          />
        );
      })}
    </div>
  );
}
