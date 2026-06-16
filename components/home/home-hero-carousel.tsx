"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTranslation } from "@/lib/contexts/TranslationContext";

export type HomeHeroItem = {
  id: string;
  type: "image" | "video";
  title?: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;
};

function hasDisplayableMedia(item: HomeHeroItem): boolean {
  if (item.type === "video") {
    return Boolean(item.videoUrl?.trim());
  }

  return Boolean(item.imageUrl?.trim());
}

function formatHeroDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

export function HomeHeroCarousel({ items }: { items: HomeHeroItem[] }) {
  const { currentLanguage } = useTranslation();
  const slides = items.filter(hasDisplayableMedia);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoPlayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const currentItem = slides[currentIndex];
  const hasMultiple = slides.length > 1;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
    setIsPlaying(false);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("pointerDown", () => setIsDragging(true));
    emblaApi.on("pointerUp", () => setIsDragging(false));
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (currentItem?.type !== "video" || !videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [currentItem, isPlaying]);

  useEffect(() => {
    if (currentItem?.type === "video") {
      setIsPlaying(true);
    }
  }, [currentIndex, currentItem?.type]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, currentIndex]);

  useEffect(() => {
    if (isHovered || isDragging || !hasMultiple) {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      return;
    }

    autoPlayIntervalRef.current = setInterval(() => {
      emblaApi?.scrollNext();
      setIsPlaying(false);
    }, 6000);

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [emblaApi, hasMultiple, isDragging, isHovered, slides.length]);

  const goToNext = useCallback(() => {
    emblaApi?.scrollNext();
    setIsPlaying(false);
  }, [emblaApi]);

  const goToPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    setIsPlaying(false);
  }, [emblaApi]);

  const goToIndex = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      setIsPlaying(false);
    },
    [emblaApi],
  );

  if (
    slides.length === 0 ||
    !currentItem ||
    !hasDisplayableMedia(currentItem)
  ) {
    return null;
  }

  const showOverlay = Boolean(
    currentItem.title || currentItem.description || currentItem.date,
  );
  const isEmbedVideo =
    currentItem.videoUrl &&
    (currentItem.videoUrl.includes("youtube.com") ||
      currentItem.videoUrl.includes("youtu.be") ||
      currentItem.videoUrl.includes("vimeo.com"));

  return (
    <section
      id="home-hero"
      className="relative min-h-[55vh] md:min-h-[65vh] w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => {
            const slideIsEmbedVideo =
              slide.videoUrl &&
              (slide.videoUrl.includes("youtube.com") ||
                slide.videoUrl.includes("youtu.be") ||
                slide.videoUrl.includes("vimeo.com"));

            return (
              <div
                key={slide.id}
                className="relative min-w-0 flex-[0_0_100%] h-[55vh] md:h-[65vh]"
              >
                {slide.type === "video" && slide.videoUrl ? (
                  slideIsEmbedVideo ? (
                    <iframe
                      src={slide.videoUrl}
                      className="absolute inset-0 h-full w-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title={slide.title || "Hero video"}
                    />
                  ) : (
                    <video
                      ref={slide.id === currentItem.id ? videoRef : undefined}
                      key={slide.videoUrl}
                      autoPlay={slide.id === currentItem.id}
                      loop
                      muted={isMuted}
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                      src={slide.videoUrl}
                      poster={slide.imageUrl}
                    />
                  )
                ) : slide.imageUrl ? (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.imageAlt || ""}
                    fill
                    className="object-cover"
                    priority={slide.id === slides[0]?.id}
                    loading={slide.id === slides[0]?.id ? "eager" : "lazy"}
                    sizes="100vw"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {showOverlay ? <div className="absolute inset-0 bg-black/35" /> : null}

      {showOverlay ? (
        <div className="pointer-events-none relative z-10 flex min-h-[55vh] md:min-h-[65vh] items-end px-6 pb-10 md:px-12 md:pb-14">
          <div className="max-w-2xl space-y-3">
            {currentItem.title ? (
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
                {currentItem.title}
              </h2>
            ) : null}
            {currentItem.date ? (
              <p className="text-sm text-white/80 md:hidden">
                {formatHeroDate(currentItem.date, currentLanguage)}
              </p>
            ) : null}
            {currentItem.description ? (
              <p className="max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
                {currentItem.description}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {currentItem.type === "video" && currentItem.videoUrl && !isEmbedVideo ? (
        <div className="absolute bottom-4 left-4 z-20 flex gap-2 md:bottom-6 md:left-6">
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className="rounded-md bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="rounded-md bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      ) : null}

      {hasMultiple ? (
        <>
          <div className="absolute inset-y-0 left-0 z-20 flex items-center pl-2 md:pl-4">
            <button
              type="button"
              onClick={goToPrev}
              className="rounded-md bg-black/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-2 md:pr-4">
            <button
              type="button"
              onClick={goToNext}
              className="rounded-md bg-black/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-6">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-6 bg-white"
                    : "w-3 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
