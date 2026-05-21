import type { Metadata } from "next";

export const siteConfig = {
  name: "Wêrê Klub",
  description:
    "Amour et boucan. Collectif artistique à Abidjan fondé par Soumia et Lucie. Soirées, résidences, transmission et rencontres.",
  url: "https://wereklub.com",
  /** 1200×630 JPEG — preferred by WhatsApp, iMessage, Facebook link previews */
  ogImagePath: "/og.jpg",
  twitterHandle: "@wereklub",
} as const;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}

type BuildPageMetadataOptions = {
  title: string;
  description?: string;
  /** Path only, e.g. `/events/my-event` */
  path?: string;
  /** Absolute Sanity/CDN URL or site path such as `/og.jpg` */
  imageUrl?: string;
  imageAlt?: string;
  type?: "website" | "article";
};

function resolveOgImageUrl(imageUrl?: string): string {
  if (!imageUrl) return siteConfig.ogImagePath;
  return imageUrl.startsWith("http") ? imageUrl : imageUrl;
}

function buildSocialMetadata({
  title,
  description,
  path,
  imageUrl,
  imageAlt,
  type = "website",
}: BuildPageMetadataOptions): Pick<Metadata, "openGraph" | "twitter"> {
  const desc = description ?? siteConfig.description;
  const image = resolveOgImageUrl(imageUrl);
  const pageUrl = path ? absoluteUrl(path) : siteConfig.url;

  return {
    openGraph: {
      title,
      description: desc,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
          type: image.includes(".webp") ? "image/webp" : "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [image],
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
    },
  };
}

/** Default Open Graph + Twitter image tags merged into every page. */
export function buildPageMetadata(
  options: BuildPageMetadataOptions,
): Metadata {
  const { title, description } = options;
  const desc = description ?? siteConfig.description;

  return {
    title,
    description: desc,
    ...buildSocialMetadata(options),
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  ...buildSocialMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
  }),
};
