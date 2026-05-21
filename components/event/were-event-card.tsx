import Image from "next/image";
import Link from "next/link";

export interface WereEventCard {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  time: string;
  /** Preformatted "time • date" for display */
  timeAndDate: string;
  venue: string;
  address: string;
  lineup: string[];
  features?: string[];
  prices?: { prevente: string; surplace: string };
  /** True when Sanity `gallery` has at least one image */
  hasGallery?: boolean;
  /** Split upcoming vs past — affects pricing and optional gallery hash link */
  isPast?: boolean;
  ticketsAvailable?: boolean;
  image: string;
  bgColor: string;
  textColor: string;
}

interface WereEventCardProps {
  event: WereEventCard;
  reserveLabel?: string;
  galleryLabel?: string;
}

function eventHref(event: WereEventCard): string {
  const base = `/events/${event.slug}`;
  if (event.isPast && event.hasGallery) return `${base}#event-gallery`;
  return base;
}

function panelButton(
  event: WereEventCard,
  reserveLabel?: string,
  galleryLabel?: string,
): { label: string; show: boolean } | null {
  if (event.isPast) {
    if (event.hasGallery && galleryLabel) {
      return { label: galleryLabel, show: true };
    }
    return null;
  }
  if (event.ticketsAvailable !== false && reserveLabel) {
    return { label: reserveLabel, show: true };
  }
  return null;
}

export function WereEventCard({
  event,
  reserveLabel,
  galleryLabel,
}: WereEventCardProps) {
  const href = eventHref(event);
  const cta = panelButton(event, reserveLabel, galleryLabel);

  return (
    <article className="grid grid-cols-1 md:grid-cols-2 border-b border-border/20 last:border-b-0">
      <Link
        href={href}
        className="relative aspect-square md:aspect-auto md:min-h-[min(100vw,520px)] lg:min-h-[600px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      </Link>

      <div
        className="flex min-h-[min(100vw,420px)] md:min-h-[min(100vw,520px)] lg:min-h-[600px] flex-col justify-between p-8 md:p-12 lg:p-16"
        style={{ backgroundColor: event.bgColor, color: event.textColor }}
      >
        <Link href={href} className="space-y-6 outline-none group">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-balance uppercase group-hover:opacity-90 transition-opacity">
            {event.title}
          </h2>

          {event.subtitle ? (
            <p className="text-sm md:text-base tracking-wide uppercase opacity-80 -mt-2">
              {event.subtitle}
            </p>
          ) : null}

          <div className="space-y-2 text-sm md:text-base tracking-wide uppercase">
            <p className="font-semibold">{event.timeAndDate}</p>
            <p>{event.venue}</p>
            <p className="opacity-80">{event.address}</p>
          </div>

          {event.features && event.features.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {event.features.map((feature) => (
                <span
                  key={feature}
                  className="text-xs md:text-sm tracking-widest uppercase px-3 py-1 border"
                  style={{ borderColor: event.textColor }}
                >
                  {feature}
                </span>
              ))}
            </div>
          ) : null}
        </Link>

        <div className="mt-10 md:mt-12 space-y-6">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.25em] uppercase opacity-70">
              Line-up
            </p>
            <p className="text-sm md:text-base uppercase tracking-wide leading-relaxed font-medium">
              {event.lineup.join(" — ")}
            </p>
          </div>

          {event.prices ? (
            <div
              className="flex gap-8 pt-4 border-t"
              style={{ borderColor: `${event.textColor}30` }}
            >
              <div>
                <p className="text-xs tracking-[0.25em] uppercase opacity-70">
                  Prévente
                </p>
                <p>
                  <span className="text-lg md:text-xl font-bold">
                    {event.prices.prevente}
                  </span>{" "}
                  F
                </p>
              </div>
              <div>
                <p className="text-xs tracking-[0.25em] uppercase opacity-70">
                  Sur place
                </p>
                <p>
                  <span className="text-lg md:text-xl font-bold">
                    {event.prices.surplace}
                  </span>{" "}
                  F
                </p>
              </div>
            </div>
          ) : null}

          {cta?.show ? (
            <Link
              href={href}
              className="inline-flex items-center justify-center rounded-full border px-6 py-2.5 text-xs md:text-sm font-semibold tracking-[0.2em] uppercase transition-opacity hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{
                borderColor: event.textColor,
                color: event.textColor,
              }}
            >
              {cta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
