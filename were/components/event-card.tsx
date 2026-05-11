import Image from "next/image"

export interface Event {
  id: string
  title: string
  subtitle?: string
  date: string
  time: string
  venue: string
  address: string
  lineup: string[]
  features?: string[]
  prices?: { prevente: string; surplace: string }
  image: string
  bgColor: string
  textColor: string
}

interface EventCardProps {
  event: Event
  reversed?: boolean
}

export function EventCard({ event, reversed = false }: EventCardProps) {
  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2"
      style={{ backgroundColor: event.bgColor }}
    >
      <div className={`relative aspect-square md:aspect-auto md:min-h-[600px] ${reversed ? "md:order-2" : ""}`}>
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
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
            <p className="font-semibold">{event.time} &bull; {event.date}</p>
            <p>{event.venue}</p>
            <p className="opacity-80">{event.address}</p>
          </div>

          {event.features && (
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
            <p className="text-xs tracking-widest uppercase opacity-70">Line-up</p>
            <p className="text-sm md:text-base uppercase tracking-wide leading-relaxed font-medium">
              {event.lineup.join(" \u2022 ")}
            </p>
          </div>

          {event.prices && (
            <div className="flex gap-8 pt-4 border-t" style={{ borderColor: `${event.textColor}30` }}>
              <div>
                <p className="text-xs tracking-widest uppercase opacity-70">Prevente</p>
                <p className="text-lg md:text-xl font-bold">{event.prices.prevente} F</p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase opacity-70">Surplace</p>
                <p className="text-lg md:text-xl font-bold">{event.prices.surplace} F</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
