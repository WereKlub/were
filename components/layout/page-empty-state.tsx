import type { ReactNode } from "react";

export function PageEmptyState({ children }: { children: ReactNode }) {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 text-center">
      <p className="mx-auto max-w-md text-muted-foreground text-sm leading-relaxed">
        {children}
      </p>
    </section>
  );
}
