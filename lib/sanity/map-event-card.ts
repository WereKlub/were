import type { WereEventCard } from "@/components/event/were-event-card";
import type { SanityEventCardSource } from "@/lib/sanity/queries";

const CREAM = "#f5f0eb";
const INK = "#1a1a1a";

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d
    .toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", "H")}`;
}

function formatPriceXof(n: number): string {
  return Math.round(n).toLocaleString("fr-FR");
}

function pickPrices(raw: SanityEventCardSource["ticketTypes"]):
  | { prevente: string; surplace: string }
  | undefined {
  if (!raw?.length) return undefined;
  const active = raw.filter((t) => t.active !== false && t.price != null);
  const sorted = [...active].sort(
    (a, b) => (a.price ?? 0) - (b.price ?? 0),
  );
  if (sorted.length === 0) return undefined;
  if (sorted.length === 1) {
    const p = formatPriceXof(sorted[0].price!);
    return { prevente: p, surplace: p };
  }
  return {
    prevente: formatPriceXof(sorted[0].price!),
    surplace: formatPriceXof(sorted[sorted.length - 1].price!),
  };
}

export function mapSanityEventToWereCard(
  raw: SanityEventCardSource,
  listIndex: number,
  options?: { isPast?: boolean },
): WereEventCard | null {
  if (!raw.slug) return null;

  const isPast = options?.isPast === true;

  const venue = raw.location?.venueName?.trim() || "";
  const address = raw.location?.address?.trim() || "";

  const lineup =
    raw.lineup?.map((a) => a.name?.trim()).filter(Boolean) as string[];

  const lightBg = listIndex % 2 === 0;
  const bgColor = lightBg ? CREAM : INK;
  const textColor = lightBg ? INK : "#ffffff";

  const timeStr = formatEventTime(raw.date);
  const dateStr = formatEventDate(raw.date);
  const timeAndDate =
    timeStr && dateStr ? `${timeStr} • ${dateStr}` : dateStr || timeStr;

  const galleryCount = raw.galleryCount ?? 0;

  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle,
    date: dateStr,
    time: timeStr,
    timeAndDate,
    venue: venue || "—",
    address: address || "—",
    lineup: lineup.length ? lineup : ["—"],
    features: undefined,
    prices: isPast ? undefined : pickPrices(raw.ticketTypes),
    hasGallery: galleryCount > 0,
    isPast,
    image: raw.flyerUrl || "/banner.webp",
    bgColor,
    textColor,
  };
}
