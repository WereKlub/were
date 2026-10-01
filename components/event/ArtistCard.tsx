"use client";

import Image from "next/image";
import Link from "next/link";
import { IG } from "@/components/icons/IG";
import { t } from "@/lib/i18n/translations";

interface Artist {
  _id: string;
  name: string;
  bio?: string;
  image?: string;
  socialLink?: string;
  isResident?: boolean;
}

interface ArtistCardProps {
  artist: Artist;
  currentLanguage: string;
}

export default function ArtistCard({
  artist,
  currentLanguage,
}: ArtistCardProps) {
  const artistDisplayName = artist.name || "Artist";

  return (
    <div className="flex h-64 w-full overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-xl">
      {artist.image ? (
        <div className="relative h-full w-48 shrink-0 sm:w-64">
          <Image
            src={artist.image}
            alt={t(currentLanguage, "artistCard.imageAlt", {
              artistName: artistDisplayName,
            })}
            fill
            className="object-cover"
            sizes="256px"
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col px-4 py-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="min-w-0 truncate text-base font-semibold text-foreground">
            {artist.name}
          </h4>
          <div className="flex h-5 shrink-0 items-center gap-2">
            {artist.isResident ? (
              <div className="inline-flex h-5 items-center rounded-md bg-green-100 px-1.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <span className="relative mr-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-md bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-md bg-green-500"></span>
                </span>
                {t(currentLanguage, "artistCard.residentBadge")}
              </div>
            ) : null}
            {artist.socialLink ? (
              <Link
                href={artist.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(currentLanguage, "artistCard.socialAriaLabel", {
                  artistName: artistDisplayName,
                })}
                className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground transition-colors hover:text-[#E4405F]"
              >
                <IG className="h-5 w-5" />
              </Link>
            ) : null}
          </div>
        </div>

        {artist.bio ? (
          <div
            className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-auto text-sm leading-6 text-muted-foreground"
            onWheel={(event) => {
              const el = event.currentTarget;
              const max = el.scrollHeight - el.clientHeight;
              if (max <= 1) return;
              const atTop = el.scrollTop <= 0;
              const atBottom = el.scrollTop >= max - 1;
              const delta = event.deltaY;
              if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
                window.scrollBy(0, delta);
              }
            }}
          >
            {artist.bio.split("\n").map((line, index) => {
              const trimmedLine = line.trim();
              if (trimmedLine === "") {
                return <br key={index} />;
              }
              return <p key={index}>{trimmedLine}</p>;
            })}
          </div>
        ) : (
          <p className="text-xs italic text-muted-foreground">
            {t(
              currentLanguage,
              artist.socialLink || artist.image
                ? "artistCard.noBio"
                : "artistCard.noDetails",
            )}
          </p>
        )}
      </div>
    </div>
  );
}
