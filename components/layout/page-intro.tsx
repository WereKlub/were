import type { ReactNode } from "react";
import { cn } from "@/lib/actions/utils";

export function PageIntro({
  title,
  subtitle,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  /** Narrow column for heading + subtitle (matches footer-aligned intro). */
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "w-full px-6 py-16 md:px-12 md:py-20",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className={cn("max-w-lg md:max-w-xl", bodyClassName)}>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight mb-8 text-balance md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
