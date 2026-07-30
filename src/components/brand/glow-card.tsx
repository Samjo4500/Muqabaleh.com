import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

export function GlowCard({ children, className }: GlowCardProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-4", className)}>
      {children}
    </div>
  );
}
