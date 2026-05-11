import Image from "next/image";
import Link from "next/link";
import type { WereEventCard } from "@/components/event/were-event-card";

function eventHref(event: WereEventCard): string {
  const base = `/events/${event.slug}`;
  if (event.isPast && event.hasGallery) return `${base}#event-gallery`;
  return base;
}

export function EventIndexGrid({ events }: { events: WereEventCard[] }) {
  if (events.length === 0) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto pb-16 md:pb-20">
      {events.map((event) => (
        <EventIndexCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function EventIndexCard({ event }: { event: WereEventCard }) {
  return (
    <Link
      href={eventHref(event)}
      className="group flex flex-col border border-border bg-card text-card-foreground hover:border-foreground/25 transition-colors rounded-sm overflow-hidden shadow-sm"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="p-3 md:p-4 border-t border-border flex flex-col gap-2 grow">
        <p className="text-[10px] md:text-xs tracking-[0.22em] uppercase text-muted-foreground line-clamp-2">
          {event.timeAndDate}
        </p>
        <h3 className="font-display text-base md:text-lg font-bold uppercase tracking-tight text-balance leading-snug group-hover:text-foreground/90">
          {event.title}
        </h3>
        <p className="text-[11px] md:text-xs tracking-wide uppercase text-muted-foreground line-clamp-2 mt-auto">
          {event.venue}
        </p>
      </div>
    </Link>
  );
}
