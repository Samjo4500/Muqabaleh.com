import Image from "next/image";
import { cn } from "@/lib/utils";

type Interviewer = "fahd" | "noora";
type AvatarSize = "sm" | "md" | "lg" | "xl";

interface InterviewAvatarProps {
  who: Interviewer;
  size?: AvatarSize;
  className?: string;
  pro?: boolean;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 40,
  md: 56,
  lg: 80,
  xl: 120,
};

const imageMap: Record<Interviewer, string> = {
  fahd: "/images/fahd.webp",
  noora: "/images/noora.webp",
};

const proImageMap: Record<Interviewer, string> = {
  fahd: "/images/fahd-pro.webp",
  noora: "/images/noora-pro.webp",
};

const altMap: Record<Interviewer, string> = {
  fahd: "\u0641\u0647\u062F \u2014 \u0645\u062D\u0627\u0648\u0631\u0643 \u0627\u0644\u0645\u0647\u0646\u064A | Fahd \u2014 Your Professional Interviewer",
  noora: "\u0646\u0648\u0631\u0629 \u2014 \u0645\u062D\u0627\u0648\u0631\u062A\u0643 \u0627\u0644\u0645\u0647\u0646\u064A\u0629 | Noora \u2014 Your Professional Interviewer",
};

export function InterviewAvatar({
  who,
  size = "md",
  className,
  pro = false,
}: InterviewAvatarProps) {
  const px = sizeMap[size];
  const ringWidth = size === "xl" ? 4 : size === "lg" ? 3 : 2;
  const src = pro ? proImageMap[who] : imageMap[who];

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        className
      )}
      style={{ width: px, height: px }}
    >
      {/* Gold ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            size === "xl"
              ? "linear-gradient(135deg, #F5D67B, #D4A843, #B8912A, #D4A843, #F5D67B)"
              : "linear-gradient(135deg, #D4A843, #D4A843)",
          padding: `${ringWidth}px`,
        }}
      >
        <div className="h-full w-full rounded-full bg-void" />
      </div>
      <Image
        src={src}
        alt={altMap[who]}
        width={px - ringWidth * 2}
        height={px - ringWidth * 2}
        className="relative z-10 rounded-full object-cover"
        priority={size === "xl"}
      />
      {/* Online indicator (only on lg/xl) */}
      {(size === "lg" || size === "xl") && (
        <span className="absolute bottom-0 end-0 z-20 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--bg-void)] bg-emerald">
          <span className="h-2 w-2 rounded-full bg-emerald" />
        </span>
      )}
    </div>
  );
}
