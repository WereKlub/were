import Image from "next/image";

const DEFAULT_EYEBROW = "Collectif Musical • Abidjan";
const DEFAULT_PILLS = ["Music", "Live", "Pop Up Store", "Food"];

interface WereHeroProps {
  imageUrl: string;
  imageAlt: string;
}

export function WereHero({ imageUrl, imageAlt }: WereHeroProps) {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
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

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-none">
          Wêrê
          <br />
          Klub
        </h1>
        <p className="mt-8 text-sm md:text-base text-white/90 tracking-[0.3em] uppercase">
          {DEFAULT_EYEBROW}
        </p>
        <p className="mt-8 flex flex-wrap justify-center gap-x-1 gap-y-2 text-xs md:text-sm text-white/70 tracking-widest uppercase text-center">
          {DEFAULT_PILLS.map((word, i) => (
            <span key={`${word}-${i}`}>
              {i > 0 ? (
                <>
                  {" "}
                  <span aria-hidden="true">&bull;</span>{" "}
                </>
              ) : null}
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
