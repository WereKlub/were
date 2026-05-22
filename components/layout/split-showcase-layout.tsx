import type { ReactNode } from "react";
import { cn } from "@/lib/actions/utils";
import {
  VerticalImageCarousel,
  type CarouselImage,
} from "@/components/layout/vertical-image-carousel";

interface SplitShowcaseLayoutProps {
  images: CarouselImage[];
  panelColor: string;
  panelTextColor: string;
  children: ReactNode;
  className?: string;
}

export function SplitShowcaseLayout({
  images,
  panelColor,
  panelTextColor,
  children,
  className,
}: SplitShowcaseLayoutProps) {
  return (
    <section
      className={cn(
        "grid min-h-[calc(100dvh-3.75rem)] grid-cols-1 lg:grid-cols-2",
        className,
      )}
    >
      <VerticalImageCarousel
        images={images}
        className="lg:sticky lg:top-15 lg:h-[calc(100dvh-3.75rem)]"
      />

      <div
        className="flex flex-col justify-between px-6 py-10 md:px-10 md:py-14 lg:px-14 lg:py-16"
        style={{ background: panelColor, color: panelTextColor }}
      >
        {children}
      </div>
    </section>
  );
}
