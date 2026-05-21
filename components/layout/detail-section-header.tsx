import { cn } from "@/lib/actions/utils";

interface DetailSectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  id?: string;
}

/** Left-aligned section heading for detail pages (events, blog articles, etc.). */
export function DetailSectionHeader({
  title,
  description,
  className,
  id,
}: DetailSectionHeaderProps) {
  return (
    <div
      id={id}
      className={cn("mb-6 border-b border-border pb-4", className)}
    >
      <h2 className="text-sm md:text-base tracking-[0.3em] uppercase text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
