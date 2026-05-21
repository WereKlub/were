"use client";

import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

import { cn } from "@/lib/actions/utils";

export type CardioLoaderVariant = "full" | "compact" | "inline";

interface CardioLoaderProps {
  variant?: CardioLoaderVariant;
  className?: string;
}

export default function CardioLoader({
  variant = "full",
  className,
}: CardioLoaderProps) {
  const cfg =
    variant === "inline"
      ? { size: "22", stroke: "2.5" }
      : variant === "compact"
        ? { size: "30", stroke: "3" }
        : { size: "36", stroke: "3" };

  return (
    <div
      className={cn(
        "flex items-center justify-center text-foreground",
        variant === "full" && "min-h-[32vh] py-16 md:py-20",
        variant === "compact" && "min-h-[140px] py-10",
        variant === "inline" && "min-h-0 py-0",
        className,
      )}
      aria-hidden
    >
      <Cardio
        size={cfg.size}
        stroke={cfg.stroke}
        speed="2"
        color="currentColor"
      />
    </div>
  );
}
