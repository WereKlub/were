import { WereEventCard } from "@/components/event/were-event-card";
import type { WereEventCard as WereEventCardModel } from "@/components/event/were-event-card";

export function EventStackList({
  events,
  reserveLabel,
  galleryLabel,
}: {
  events: WereEventCardModel[];
  reserveLabel?: string;
  galleryLabel?: string;
}) {
  if (events.length === 0) return null;

  return (
    <div className="flex flex-col">
      {events.map((event) => (
        <WereEventCard
          key={event.id}
          event={event}
          reserveLabel={reserveLabel}
          galleryLabel={galleryLabel}
        />
      ))}
    </div>
  );
}
