import Image from "next/image";
import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop();
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
  } catch {
    return null;
  }

  return null;
}

const blogPortableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 font-display text-2xl font-bold uppercase tracking-tight text-foreground first:mt-0 md:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 font-display text-xl font-bold uppercase tracking-tight text-foreground md:text-2xl">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-2 text-lg font-semibold text-foreground">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="mb-4 leading-relaxed text-muted-foreground last:mb-0">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-2 pl-6 text-muted-foreground">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = (value as { href?: string })?.href || "#";
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const image = value as {
        asset?: { url?: string };
        alt?: string;
        caption?: string;
      };
      const url = image.asset?.url;
      if (!url) return null;

      return (
        <figure className="my-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border/40 bg-muted">
            <Image
              src={url}
              alt={image.alt || image.caption || "Article image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
          {image.caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    videoEmbed: ({ value }) => {
      const embed = value as { url?: string; caption?: string };
      if (!embed.url) return null;

      const embedUrl = getEmbedUrl(embed.url);
      if (!embedUrl) {
        return (
          <p className="my-6 text-sm text-muted-foreground">
            <a
              href={embed.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {embed.url}
            </a>
          </p>
        );
      }

      return (
        <figure className="my-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border/40 bg-muted shadow-lg">
            <iframe
              src={embedUrl}
              title={embed.caption || "Embedded video"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {embed.caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {embed.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

interface BlogPortableTextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export function BlogPortableText({ value }: BlogPortableTextProps) {
  if (!value) return null;
  return (
    <PortableText value={value} components={blogPortableTextComponents} />
  );
}
