import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SectionHeader } from "@/components/section-header"
import Image from "next/image"

const galleryImages = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/18-zwAqmp3KLWFnn2NTmS81sb2bBi1O1k.jpg",
    alt: "DJ performing at Wêrê Klub",
    event: "WÊRÊ KLUB #12",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/16-sv2nqRmmrxDUAaqYpbYgnncRZlQUG7.jpg",
    alt: "Party vibes",
    event: "WÊRÊ KLUB #12",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03740-FnFcxZrEU6kMPhGaLxhB5z4u848Hcj.jpg",
    alt: "Live performance",
    event: "GASOLEO",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03881-nMw58iEtc2t1wmSy5gK3IYl60cLrkh.jpg",
    alt: "Crowd dancing",
    event: "WÊRÊ KLUB #11",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19-BDtBp7L2ah2hgLILoajpURhJYiPvNQ.jpg",
    alt: "Light show",
    event: "GASOLEO",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03642-55QQlqz9fxkYmXgJpzV87D0jaYsMWA.jpg",
    alt: "Pop up store",
    event: "WÊRÊ KLUB #12",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/17-UrbKBC6B3b2KDs0AB0XCNJbFa5OwpL.jpg",
    alt: "Artist performing",
    event: "WÊRÊ KLUB #11",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oui_-otUrUaBEchK8Iki3tCiuTqCTPqGP5C.png",
    alt: "Event poster",
    event: "WÊRÊ KLUB #13",
  },
]

export default function GaleriePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <SectionHeader title="GALERIE" />

      {/* Gallery Grid */}
      <section className="px-2 md:px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
          {galleryImages.map((image, index) => (
            <div 
              key={index} 
              className="relative aspect-square overflow-hidden group cursor-pointer"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end justify-center pb-6">
                <p className="text-white text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.event}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
