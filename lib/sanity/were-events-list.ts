import type { SanityEventCardSource } from "@/lib/sanity/queries";
import { mapSanityEventToWereCard } from "@/lib/sanity/map-event-card";
import type { WereEventCard } from "@/components/event/were-event-card";

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function buildWereEventLists(raw: SanityEventCardSource[]): {
  upcomingCards: WereEventCard[];
  pastCards: WereEventCard[];
} {
  const t0 = startOfTodayMs();
  const upcomingRaw = raw
    .filter((e) => new Date(e.date).getTime() >= t0)
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  const pastRaw = raw
    .filter((e) => new Date(e.date).getTime() < t0)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

  const upcomingCards = upcomingRaw
    .map((e, i) => mapSanityEventToWereCard(e, i, { isPast: false }))
    .filter((c): c is WereEventCard => c !== null);

  const pastCards = pastRaw
    .map((e, i) => mapSanityEventToWereCard(e, i, { isPast: true }))
    .filter((c): c is WereEventCard => c !== null);

  return { upcomingCards, pastCards };
}
