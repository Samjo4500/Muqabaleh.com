"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyLinkButtonProps {
  text: string;
  className?: string;
}

export function CopyLinkButton({ text, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[var(--text-muted)] transition-all hover:border-gold/30 hover:text-gold",
        copied && "border-emerald/30 text-emerald",
        className
      )}
      aria-label={copied ? "Copied" : "Copy link"}
    >
      {copied ? (
        <Check size={20} strokeWidth={1.75} />
      ) : (
        <Copy size={20} strokeWidth={1.75} />
      )}
    </button>
  );
}
