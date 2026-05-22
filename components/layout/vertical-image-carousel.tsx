"use client";

import Image from "next/image";
import { useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/actions/utils";

export type CarouselImage = {
  url: string;
  alt: string;
};

interface VerticalImageCarouselProps {
  images: CarouselImage[];
  className?: string;
}

export function VerticalImageCarousel({
  images,
  className,
}: VerticalImageCarouselProps) {
  const loopImages = useMemo(() => [...images, ...images], [images]);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-[45vh] items-center justify-center bg-muted text-muted-foreground text-sm lg:min-h-0 lg:h-full",
          className,
        )}
      >
        Add carousel images in Sanity
      </div>
    );
  }

  const durationSeconds = Math.max(images.length * 12, 36);

  return (
    <div
      className={cn(
        "relative min-h-[45vh] overflow-hidden bg-black lg:min-h-0 lg:h-full",
        className,
      )}
    >
      <div
        className="vertical-scroll-track group flex flex-col"
        style={
          {
            "--scroll-duration": `${durationSeconds}s`,
          } as CSSProperties
        }
      >
        {loopImages.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="relative aspect-3/4 w-full shrink-0 sm:aspect-4/5"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={index < 2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
