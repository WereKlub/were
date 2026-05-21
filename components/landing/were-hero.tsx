import Image from "next/image";

interface WereHeroProps {
  imageUrl: string;
  imageAlt: string;
  tagline?: string;
  subtitle?: string;
  byline?: string;
}

export function WereHero({
  imageUrl,
  imageAlt,
  tagline,
  subtitle,
  byline,
}: WereHeroProps) {
  const showBranding = Boolean(tagline || subtitle || byline);

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {showBranding ? (
        <div className="relative z-10 flex min-h-[70vh] md:min-h-[80vh] items-end px-6 pb-12 md:px-12 md:pb-16">
          <div className="max-w-2xl space-y-3">
            <p className="font-display text-xs tracking-[0.35em] uppercase text-white/70">
              Wêrê Klub
            </p>
            {tagline ? (
              <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
                {tagline}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
                {subtitle}
              </p>
            ) : null}
            {byline ? (
              <p className="text-xs tracking-wide text-white/60 uppercase">
                {byline}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
