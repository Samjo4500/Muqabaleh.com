import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlowCard({ children, className, ...props }: GlowCardProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-4", className)} {...props}>
      {children}
    </div>
  );
}
