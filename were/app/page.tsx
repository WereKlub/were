import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SectionHeader } from "@/components/section-header"
import { EventCard, type Event } from "@/components/event-card"
import { Footer } from "@/components/footer"

const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "WÊRÊ KLUB",
    subtitle: "VEN 13 JUIN",
    date: "13 JUIN 2026",
    time: "18H - 04H",
    venue: "SOMETHING ART SPACE",
    address: "BLOCKHAUSS",
    lineup: ["BADDEST", "SOUMIA", "LAISSONSLUCIEFAIRE"],
    features: ["MUSIC", "LIVE", "TATOO", "FOOD"],
    prices: { prevente: "5 000", surplace: "8 000" },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oui_-otUrUaBEchK8Iki3tCiuTqCTPqGP5C.png",
    bgColor: "#f5f0eb",
    textColor: "#1a1a1a"
  },
]

const pastEvents: Event[] = [
  {
    id: "2",
    title: "ODUNSI DANS LE KLUB",
    subtitle: "02 MAI 2026",
    date: "02 MAI 2026",
    time: "22H - 04H",
    venue: "GASOLEO",
    address: "794 RUE DE LA VICTOIRE, ZONE 3",
    lineup: ["ODUNSI (THE ENGINE)", "SOUMIA", "LAISSONSLUCIEFAIRE", "GUESTS SURPRISE"],
    prices: { prevente: "5 000", surplace: "8 000" },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03740-FnFcxZrEU6kMPhGaLxhB5z4u848Hcj.jpg",
    bgColor: "#1a1a1a",
    textColor: "#ffffff"
  },
  {
    id: "3",
    title: "WÊRÊ KLUB #12",
    subtitle: "27 MARS 2026",
    date: "27 MARS 2026",
    time: "22H - 04H",
    venue: "GASOLEO",
    address: "794 RUE DE LA VICTOIRE, ZONE 3",
    lineup: ["FLORE", "SOUMIA", "LAISSONSLUCIEFAIRE", "REINE ABLAA", "ATTITO"],
    features: ["DJ SET", "LIVE SHOW", "POP UP STORE", "FOOD"],
    prices: { prevente: "3 000", surplace: "5 000" },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03881-nMw58iEtc2t1wmSy5gK3IYl60cLrkh.jpg",
    bgColor: "#4a7c4e",
    textColor: "#ffffff"
  },
  {
    id: "4",
    title: "WÊRÊ KLUB #11",
    subtitle: "23 JANVIER 2026",
    date: "23 JANVIER 2026",
    time: "21H - 04H",
    venue: "GASOLEO",
    address: "794 RUE DE LA VICTOIRE, ZONE 3",
    lineup: ["EMY JO (LIVE)", "TOKYO", "SOUMIA", "LAISSONSLUCIEFAIRE", "GUESTS SURPRISE"],
    prices: { prevente: "5 000", surplace: "8 000" },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19-BDtBp7L2ah2hgLILoajpURhJYiPvNQ.jpg",
    bgColor: "#8b2020",
    textColor: "#ffffff"
  },
  {
    id: "5",
    title: "NOUVEL AN DANS LE KLUB",
    subtitle: "31 DECEMBRE 2025",
    date: "31 DECEMBRE 2025",
    time: "22H - 06H",
    venue: "GASOLEO",
    address: "794 RUE DE LA VICTOIRE, ZONE 3",
    lineup: ["SOUMIA", "LAISSONSLUCIEFAIRE", "SPECIAL GUESTS"],
    prices: { prevente: "10 000", surplace: "15 000" },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DSC03642-55QQlqz9fxkYmXgJpzV87D0jaYsMWA.jpg",
    bgColor: "#d4a574",
    textColor: "#1a1a1a"
  },
]

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      
      <section id="events">
        <SectionHeader title="EVENEMENTS A VENIR" />
        
        {upcomingEvents.map((event, index) => (
          <EventCard 
            key={event.id} 
            event={event} 
            reversed={index % 2 === 1}
          />
        ))}
        
        <SectionHeader title="EVENEMENTS PASSES" />
        
        {pastEvents.map((event, index) => (
          <EventCard 
            key={event.id} 
            event={event} 
            reversed={index % 2 === 1}
          />
        ))}
      </section>
      
      <Footer />
    </main>
  )
}
