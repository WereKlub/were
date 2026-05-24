import type { WereEventCard } from "@/components/event/were-event-card";
import type { SanityEventCardSource } from "@/lib/sanity/queries";
import { resolveEventCardColors } from "@/lib/sanity/event-card-colors";

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

function cheapestTicketPrice(
  raw: SanityEventCardSource["ticketTypes"],
): number | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const active = raw.filter((t) => t.active !== false && t.price != null);
  if (active.length === 0) return undefined;
  return Math.min(...active.map((t) => t.price!));
}

function highestTicketPrice(
  raw: SanityEventCardSource["ticketTypes"],
): number | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const active = raw.filter((t) => t.active !== false && t.price != null);
  if (active.length === 0) return undefined;
  return Math.max(...active.map((t) => t.price!));
}

function hasExplicitSurPlace(
  cardPricing: SanityEventCardSource["cardPricing"],
): boolean {
  return Boolean(
    cardPricing?.surPlaceLabel?.trim() ||
    cardPricing?.surPlaceAmount != null ||
    (cardPricing?.surPlaceConsos != null && cardPricing.surPlaceConsos > 0),
  );
}

function formatSurPlaceLabel(
  cardPricing: SanityEventCardSource["cardPricing"],
  fallbackPrice?: number,
): string | undefined {
  const custom = cardPricing?.surPlaceLabel?.trim();
  if (custom) return custom;

  const amount = cardPricing?.surPlaceAmount ?? fallbackPrice;
  if (amount == null) return undefined;

  const formatted = `${formatPriceXof(amount)} F`;
  const consos = cardPricing?.surPlaceConsos;
  if (consos == null || consos <= 0) return formatted;

  const drinkLabel = consos === 1 ? "1 conso" : `${consos} consos`;
  return `${formatted} + ${drinkLabel}`;
}

function pickPrices(
  raw: SanityEventCardSource,
): { prevente: string; surplace?: string } | undefined {
  const cardPricing = raw.cardPricing;
  const ticketTypes = raw.ticketTypes;

  const cheapest = cheapestTicketPrice(ticketTypes);
  const highest = highestTicketPrice(ticketTypes);
  const preventeAmount = cardPricing?.preventeAmount ?? cheapest;

  const surplaceFallback =
    hasExplicitSurPlace(cardPricing) || highest == null || highest === cheapest
      ? undefined
      : highest;

  const surplaceDisplay = formatSurPlaceLabel(cardPricing, surplaceFallback);

  if (preventeAmount == null && !surplaceDisplay) return undefined;

  return {
    prevente: preventeAmount != null ? formatPriceXof(preventeAmount) : "—",
    surplace: surplaceDisplay,
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

  const lineup = (raw.lineup ?? [])
    .map((a) => a?.name?.trim())
    .filter((name): name is string => Boolean(name));

  const { bgColor, textColor } = resolveEventCardColors(raw, listIndex);

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
    prices: isPast ? undefined : pickPrices(raw),
    hasGallery: galleryCount > 0,
    isPast,
    ticketsAvailable: raw.ticketsAvailable !== false,
    image: raw.flyerUrl || "/banner.webp",
    bgColor,
    textColor,
  };
}
