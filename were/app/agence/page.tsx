import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SectionHeader } from "@/components/section-header"
import Image from "next/image"

const services = [
  {
    title: "DIRECTION ARTISTIQUE",
    description: "Conception et curation de line-ups sur mesure pour vos événements.",
  },
  {
    title: "PRODUCTION EVENEMENTIELLE",
    description: "De la conception à l'exécution, nous gérons tous les aspects de votre événement.",
  },
  {
    title: "BOOKING ARTISTES",
    description: "Accédez à notre réseau exclusif de DJs, producteurs et performers.",
  },
  {
    title: "BRAND PARTNERSHIPS",
    description: "Créez des expériences de marque mémorables avec des activations authentiques.",
  },
]

const pastEvents = [
  {
    name: "WÊRÊ KLUB #12",
    client: "Gasoleo",
  },
  {
    name: "GASOLEO x WÊRÊ KLUB",
    client: "Gasoleo",
  },
  {
    name: "WÊRÊ KLUB #11",
    client: "Private",
  },
]

export default function AgencePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <SectionHeader title="AGENCE" />

      {/* Services */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {services.map((service, index) => (
          <div 
            key={index} 
            className={`p-8 md:p-12 lg:p-16 border-b border-gray-100 ${
              index % 2 === 0 ? "md:border-r" : ""
            }`}
          >
            <h3 className="font-display text-lg font-bold mb-3">{service.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
          </div>
        ))}
      </section>

      {/* Past Work */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-[#1a1a1a] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase mb-8">
            REALISATIONS
          </h2>
          <div className="space-y-6">
            {pastEvents.map((event, index) => (
              <div key={index} className="flex justify-between items-center border-b border-white/20 pb-4">
                <span className="font-display font-bold">{event.name}</span>
                <span className="text-sm text-white/60">{event.client}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-square md:aspect-auto md:min-h-[500px]">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03740-FnFcxZrEU6kMPhGaLxhB5z4u848Hcj.jpg"
            alt="Live performance"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-square md:aspect-auto md:min-h-[400px]">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19-BDtBp7L2ah2hgLILoajpURhJYiPvNQ.jpg"
            alt="Event atmosphere"
            fill
            className="object-cover"
          />
        </div>
        <div className="bg-[#d4a574] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase mb-4">
            UN PROJET?
          </h2>
          <p className="text-black/70 mb-8 leading-relaxed">
            Contactez-nous pour discuter de votre projet événementiel ou de booking.
          </p>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-black/50 mr-2">Email</span>
              <a href="mailto:contact@wereklub.com" className="font-medium">contact@wereklub.com</a>
            </p>
            <p className="text-sm">
              <span className="text-black/50 mr-2">Booking</span>
              <a href="mailto:booking@wereklub.com" className="font-medium">booking@wereklub.com</a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
