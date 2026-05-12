"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@teispace/next-themes";
import { useEffect, useState } from "react";

export function ThemeModeSwitch({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-8 w-[88px] shrink-0 rounded-sm border border-border bg-transparent ${className}`}
        aria-hidden
      />
    );
  }

  const btn =
    "inline-flex h-7 w-7 items-center justify-center rounded-sm text-foreground/60 transition-colors hover:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground dark:text-white/55 dark:hover:text-white dark:aria-pressed:text-white";

  return (
    <div
      role="group"
      aria-label="Theme"
      className={`flex shrink-0 items-center gap-0.5 rounded-sm border border-border p-0.5 ${className}`}
    >
      <button
        type="button"
        className={btn}
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
        title="Light"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
        title="Dark"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        aria-pressed={theme === "system"}
        onClick={() => setTheme("system")}
        title="System"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
