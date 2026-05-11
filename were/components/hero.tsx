import Image from "next/image"

export function Hero() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/18-zwAqmp3KLWFnn2NTmS81sb2bBi1O1k.jpg"
          alt="DJ performing at Wêrê Klub"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-none">
          Wêrê
          <br />
          Klub
        </h1>
        <p className="mt-8 text-sm md:text-base text-white/90 tracking-[0.3em] uppercase">
          Collectif Musical &bull; Abidjan
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-white/70 tracking-widest uppercase">
          <span>Music</span>
          <span>&bull;</span>
          <span>Live</span>
          <span>&bull;</span>
          <span>Pop Up Store</span>
          <span>&bull;</span>
          <span>Food</span>
        </div>
      </div>
    </section>
  )
}
