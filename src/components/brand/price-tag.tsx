import { cn } from "@/lib/utils";

interface PriceTagProps {
  usd: string;
  localApprox?: string;
  className?: string;
}

export function PriceTag({ usd, localApprox, className }: PriceTagProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <span className="text-3xl font-bold text-[var(--text-primary)]">
        {usd}
      </span>
      {localApprox && (
        <span className="mt-1 text-sm text-[var(--text-faint)]">
          {localApprox}
        </span>
      )}
    </div>
  );
}
