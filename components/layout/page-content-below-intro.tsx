import type { ReactNode } from "react";

import { cn } from "@/lib/actions/utils";

/**
 * Thin horizontal rule under {@link PageIntro}; main listing / page body goes below this.
 */
export function PageContentBelowIntro({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full min-w-0 shrink-0 border-t border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}
