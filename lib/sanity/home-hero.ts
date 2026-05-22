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

  return items
    .filter((item) => item.isActive !== false)
    .map((item) => {
      const imageUrl = normalizeUrl(item.image?.asset?.url);
      const videoUrl = normalizeUrl(item.video?.asset?.url || item.videoUrl);
      const mediaType = item.type === "video" ? "video" : "image";

      if (mediaType === "image" && imageUrl) {
        return {
          id: item._key,
          type: "image" as const,
          title: item.title?.trim() || undefined,
          description: item.description?.trim() || undefined,
          imageUrl,
          imageAlt: item.image?.alt?.trim() || undefined,
        };
      }

      if (mediaType === "video" && videoUrl) {
        return {
          id: item._key,
          type: "video" as const,
          title: item.title?.trim() || undefined,
          description: item.description?.trim() || undefined,
          imageUrl,
          imageAlt: item.image?.alt?.trim() || undefined,
          videoUrl,
        };
      }

      return null;
    })
    .filter((item): item is HomeHeroItem => item !== null);
}
