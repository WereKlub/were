import Image from "next/image";

interface WereHeroProps {
  imageUrl: string;
  imageAlt: string;
}

export function WereHero({ imageUrl, imageAlt }: WereHeroProps) {
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
    </section>
  );
}
