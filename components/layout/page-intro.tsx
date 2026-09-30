import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/actions/utils";
import { appPageContainerClass } from "@/components/layout/app-page-shell";

export function PageIntro({
  title,
  subtitle,
  backHref,
  backLabel,
  compact = false,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Tighter spacing for detail pages (product, event). */
  compact?: boolean;
  className?: string;
  /** Narrow column for heading + subtitle (matches footer-aligned intro). */
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "w-full py-16 md:py-20",
        compact && "py-8 md:py-10",
        className,
      )}
    >
      <div className={appPageContainerClass}>
        <div className={cn("max-w-lg md:max-w-xl", bodyClassName)}>
          {backHref && backLabel ? (
            <Link
              href={backHref}
              className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] uppercase text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3 shrink-0" strokeWidth={2} />
              <span>{backLabel}</span>
            </Link>
          ) : null}
          <h1
            className={cn(
              "font-display text-4xl font-black uppercase tracking-tight text-balance md:text-5xl",
              compact ? "mb-3" : "mb-8",
            )}
          >
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
