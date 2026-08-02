import Image from "next/image";
import { cn } from "@/lib/utils";

type Interviewer = "fahd" | "noora";
type AvatarSize = "sm" | "md" | "lg";

interface InterviewAvatarProps {
  who: Interviewer;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 40,
  md: 56,
  lg: 80,
};

const imageMap: Record<Interviewer, string> = {
  fahd: "/images/fahd.webp",
  noora: "/images/noora.webp",
};

const altMap: Record<Interviewer, string> = {
  fahd: "فهد — محاورك المهني | Fahd — Your Professional Interviewer",
  noora: "نورة — محاورتك المهنية | Noora — Your Professional Interviewer",
};

export function InterviewAvatar({
  who,
  size = "md",
  className,
}: InterviewAvatarProps) {
  const px = sizeMap[size];
  const ringWidth = size === "lg" ? 3 : 2;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        className
      )}
      style={{ width: px, height: px }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(135deg, #D4A843, #D4A843)",
          padding: `${ringWidth}px`,
        }}
      >
        <div className="h-full w-full rounded-full bg-void" />
      </div>
      <Image
        src={imageMap[who]}
        alt={altMap[who]}
        width={px - ringWidth * 2}
        height={px - ringWidth * 2}
        className="relative z-10 rounded-full object-cover"
      />
    </div>
  );
}
