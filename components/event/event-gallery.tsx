"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ImageProps } from "@/lib/utils/types";
import { ZoomImage } from "@/components/event/zoom-image";

export type EventGalleryImage = {
  _key: string;
  url: string;
  caption?: string;
  width?: number;
  height?: number;
};

function useColumnCount() {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const mq = (n: number) => window.matchMedia(`(min-width: ${n}px)`).matches;
    const update = () => {
      if (mq(1280)) setCols(4);
      else if (mq(1024)) setCols(3);
      else if (mq(640)) setCols(2);
      else setCols(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

function buildGridUrl(baseUrl: string, width = 720) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}w=${width}&auto=format&q=80`;
}

function toImageProps(img: EventGalleryImage, index: number): ImageProps {
  const urlParts = img.url.split(".");
  const format = urlParts[urlParts.length - 1]?.split("?")[0] || "jpg";

  return {
    id: index,
    height: (img.height ?? 480).toString(),
    width: (img.width ?? 720).toString(),
    public_id: img._key,
    format,
    url: buildGridUrl(img.url),
    title: img.caption,
  };
}

function GalleryItem({
  img,
  eventTitle,
  onClick,
}: {
  img: ImageProps;
  eventTitle: string;
  onClick: () => void;
}) {
  const numericWidth = parseInt(img.width, 10);
  const numericHeight = parseInt(img.height, 10);
  const hasDimensions = !isNaN(numericWidth) && !isNaN(numericHeight);
  const aspectStyle = hasDimensions
    ? { aspectRatio: `${numericWidth} / ${numericHeight}` }
    : undefined;

  return (
    <figure
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        relative overflow-hidden rounded-md bg-muted mb-2 cursor-zoom-in
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
        after:content after:pointer-events-none after:absolute after:inset-0 after:rounded-md after:shadow-highlight
        ${!hasDimensions ? "aspect-square" : ""}
      `}
      style={aspectStyle}
      aria-label={`${eventTitle} gallery photo`}
    >
      <Image
        src={img.url}
        alt={img.title || `${eventTitle} gallery photo`}
        fill
        className="object-cover brightness-90 transition will-change-auto hover:brightness-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      />
    </figure>
  );
}

export function EventGallery({
  images,
  eventTitle,
}: {
  images: EventGalleryImage[];
  eventTitle: string;
}) {
  const columnCount = useColumnCount();
  const imageProps = useMemo(
    () => images.map((img, index) => toImageProps(img, index)),
    [images],
  );
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  const columns = useMemo(() => {
    const cols: ImageProps[][] = Array.from({ length: columnCount }, () => []);
    imageProps.forEach((img, i) => cols[i % columnCount].push(img));
    return cols;
  }, [imageProps, columnCount]);

  return (
    <>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col min-w-0">
            {col.map((img, i) => {
              const globalIndex = colIndex + i * columnCount;
              return (
                <GalleryItem
                  key={img.public_id}
                  img={img}
                  eventTitle={eventTitle}
                  onClick={() => setZoomedIndex(globalIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {zoomedIndex !== null && (
        <ZoomImage
          images={imageProps}
          initialIndex={zoomedIndex}
          sectionTitle={eventTitle}
          onClose={() => setZoomedIndex(null)}
        />
      )}
    </>
  );
}
