import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SectionHeader } from "@/components/section-header"
import Image from "next/image"

const team = [
  { name: "SOUMIA", role: "DJ / Fondatrice" },
  { name: "LAISSONSLUCIEFAIRE", role: "DJ / Direction Artistique" },
  { name: "EMY JO", role: "DJ / Live" },
  { name: "TOKYO", role: "DJ" },
]

export default function AProposPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <SectionHeader title="A PROPOS" />

      {/* About Content */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* Left - Image */}
        <div className="relative aspect-square md:aspect-auto md:min-h-[500px]">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/18-zwAqmp3KLWFnn2NTmS81sb2bBi1O1k.jpg"
            alt="Wêrê Klub collectif"
            fill
            className="object-cover"
          />
        </div>

        {/* Right - Text */}
        <div className="bg-[#7cb342] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase mb-6 text-white">
            LE COLLECTIF
          </h2>
          <div className="space-y-4 text-white/90 leading-relaxed">
            <p>
              Wêrê Klub est un collectif musical basé à Abidjan, fondé en 2022 par un groupe de passionnés 
              de musique électronique, afrobeats et de culture urbaine.
            </p>
            <p>
              Notre mission est de créer des espaces de fête inclusifs où la musique, l&apos;art et la 
              communauté se rencontrent.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4">
        <div className="p-8 md:p-12 border-r border-b md:border-b-0 border-gray-100 text-center">
          <p className="font-display text-4xl md:text-5xl font-black">12+</p>
          <p className="mt-2 text-xs tracking-widest text-gray-500">EDITIONS</p>
        </div>
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 text-center">
          <p className="font-display text-4xl md:text-5xl font-black">50+</p>
          <p className="mt-2 text-xs tracking-widest text-gray-500">ARTISTES</p>
        </div>
        <div className="p-8 md:p-12 border-r border-gray-100 text-center">
          <p className="font-display text-4xl md:text-5xl font-black">5K+</p>
          <p className="mt-2 text-xs tracking-widest text-gray-500">PARTICIPANTS</p>
        </div>
        <div className="p-8 md:p-12 text-center">
          <p className="font-display text-4xl md:text-5xl font-black">2022</p>
          <p className="mt-2 text-xs tracking-widest text-gray-500">FONDATION</p>
        </div>
      </section>

      {/* Team */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-[#e8b4bc] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase mb-8">
            L&apos;EQUIPE
          </h2>
          <div className="space-y-4">
            {team.map((member, index) => (
              <div key={index} className="flex justify-between items-center border-b border-black/10 pb-4">
                <span className="font-display font-bold">{member.name}</span>
                <span className="text-sm text-black/60">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-square md:aspect-auto md:min-h-[400px]">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/16-sv2nqRmmrxDUAaqYpbYgnncRZlQUG7.jpg"
            alt="Team vibes"
            fill
            className="object-cover"
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}
