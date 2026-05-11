import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SectionHeader } from "@/components/section-header"
import Image from "next/image"

const products = [
  {
    id: 1,
    name: "T-SHIRT WÊRÊ KLUB",
    price: "15 000",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03881-nMw58iEtc2t1wmSy5gK3IYl60cLrkh.jpg",
    category: "TEXTILE",
  },
  {
    id: 2,
    name: "HOODIE WÊRÊ KLUB",
    price: "25 000",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19-BDtBp7L2ah2hgLILoajpURhJYiPvNQ.jpg",
    category: "TEXTILE",
  },
  {
    id: 3,
    name: "CASQUETTE WÊRÊ",
    price: "8 000",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/17-UrbKBC6B3b2KDs0AB0XCNJbFa5OwpL.jpg",
    category: "ACCESSOIRES",
  },
  {
    id: 4,
    name: "TOTE BAG WÊRÊ KLUB",
    price: "5 000",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03642-55QQlqz9fxkYmXgJpzV87D0jaYsMWA.jpg",
    category: "ACCESSOIRES",
  },
  {
    id: 5,
    name: "AFFICHE GASOLEO",
    price: "3 000",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-05-06%20at%2010.47.28%E2%80%AFAM-fuq3f0OrH39y4ec5Wwm6cuQuZVbJNi.jpeg",
    category: "PRINT",
  },
  {
    id: 6,
    name: "AFFICHE WÊRÊ KLUB #12",
    price: "3 000",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Visupsddddddddd-oNkYbnzK4FpQ7wjwZTpsBuJTHmwa6a.png",
    category: "PRINT",
  },
]

export default function BoutiquePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <SectionHeader title="SHOP" />

      {/* Products Grid */}
      <section className="px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {products.map((product) => (
            <article key={product.id} className="group cursor-pointer">
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                <p className="text-xs tracking-wider text-gray-500 mb-1">{product.category}</p>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display text-sm font-bold tracking-wide">{product.name}</h3>
                  <p className="text-sm">{product.price} F</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
