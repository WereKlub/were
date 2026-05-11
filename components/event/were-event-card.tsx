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
  image: string;
  bgColor: string;
  textColor: string;
}

interface WereEventCardProps {
  event: WereEventCard;
  reversed?: boolean;
}

export function WereEventCard({ event, reversed = false }: WereEventCardProps) {
  const cardHref =
    event.isPast && event.hasGallery
      ? `/events/${event.slug}#event-gallery`
      : `/events/${event.slug}`;

  return (
    <Link
      href={cardHref}
      className="grid grid-cols-1 md:grid-cols-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
      style={{ backgroundColor: event.bgColor }}
    >
      <div
        className={`relative aspect-square md:aspect-auto md:min-h-[600px] ${reversed ? "md:order-2" : ""}`}
      >
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div
        className={`flex flex-col justify-between p-8 md:p-12 lg:p-16 ${reversed ? "md:order-1" : ""}`}
        style={{ color: event.textColor }}
      >
        <div className="space-y-6">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-balance uppercase">
            {event.title}
          </h2>

          <div className="space-y-2 text-sm md:text-base tracking-wide uppercase">
            <p className="font-semibold">{event.timeAndDate}</p>
            <p>{event.venue}</p>
            <p className="opacity-80">{event.address}</p>
          </div>

          {event.features && event.features.length > 0 && (
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
          )}
        </div>

        <div className="mt-12 space-y-6">
          <div className="space-y-3">
            <p className="text-xs tracking-widest uppercase opacity-70">
              Line-up
            </p>
            <p className="text-sm md:text-base uppercase tracking-wide leading-relaxed font-medium">
              {event.lineup.join(" • ")}
            </p>
          </div>

          {event.prices && (
            <div
              className="flex gap-8 pt-4 border-t"
              style={{ borderColor: `${event.textColor}30` }}
            >
              <div>
                <p className="text-xs tracking-widest uppercase opacity-70">
                  Prévente
                </p>
                <p><span className="text-lg md:text-xl font-bold">{event.prices.prevente}</span>{" "}F</p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase opacity-70">
                  Sur place
                </p>
                <p><span className="text-lg md:text-xl font-bold">{event.prices.surplace}</span>{" "}F</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
