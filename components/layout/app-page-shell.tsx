import type { ReactNode } from "react";
import { cn } from "@/lib/actions/utils";

/** Outer wrapper: full-height column, theme surface (use on every full page including admin). */
export const appPageShellClass =
  "flex flex-col min-h-screen w-full bg-background text-foreground";

/** Standard horizontal gutters + max width for index/detail content areas. */
export const appPageContainerClass =
  "mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12";

export function AppPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(appPageShellClass, className)}>{children}</div>
  );
}

export function AppPageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(appPageContainerClass, className)}>{children}</div>
  );
}
