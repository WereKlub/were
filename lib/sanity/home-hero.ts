import type { HomepageHeroItem } from "@/lib/sanity/queries";
import type { HomeHeroItem } from "@/components/home/home-hero-carousel";

function normalizeUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function mapHomepageHeroItems(
  items: HomepageHeroItem[] | undefined,
): HomeHeroItem[] {
  if (!items?.length) return [];

  const slides: HomeHeroItem[] = [];

  for (const item of items) {
    if (item.isActive === false) continue;

    const imageUrl = normalizeUrl(item.image?.asset?.url);
    const videoUrl = normalizeUrl(item.video?.asset?.url || item.videoUrl);
    const mediaType = item.type === "video" ? "video" : "image";

    if (mediaType === "image" && imageUrl) {
      slides.push({
        id: item._key,
        type: "image",
        title: item.title?.trim() || undefined,
        description: item.description?.trim() || undefined,
        imageUrl,
        imageAlt: item.image?.alt?.trim() || undefined,
      });
      continue;
    }

    if (mediaType === "video" && videoUrl) {
      slides.push({
        id: item._key,
        type: "video",
        title: item.title?.trim() || undefined,
        description: item.description?.trim() || undefined,
        imageUrl,
        imageAlt: item.image?.alt?.trim() || undefined,
        videoUrl,
      });
    }
  }

  return slides;
}
