import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  sub?: string;
  titleHighlight?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  titleHighlight,
  className,
}: SectionHeadingProps) {
  const renderTitle = () => {
    if (titleHighlight && title.includes(titleHighlight)) {
      const parts = title.split(titleHighlight);
      return (
        <>
          {parts[0]}
          <span className="gold-gradient-text">{titleHighlight}</span>
          {parts.slice(1).join(titleHighlight)}
        </>
      );
    }
    return title;
  };

  return (
    <div className={cn("text-center", className)}>
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        {renderTitle()}
      </h2>
      {sub && (
        <p className="mx-auto mt-4 max-w-2xl text-[var(--text-muted)]">
          {sub}
        </p>
      )}
    </div>
  );
}
