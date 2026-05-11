import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { SectionHeader } from "@/components/landing/section-header";
import { getAgencyPage } from "@/lib/sanity/queries";
import { AppPageShell } from "@/components/layout/app-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAgencyPage();
  return {
    title: data?.metaTitle ?? "Agence | Wêrê Klub",
    description:
      data?.metaDescription ??
      "Direction artistique, production événementielle et booking — Wêrê Klub.",
  };
}

export default async function AgencePage() {
  const data = await getAgencyPage();
  if (
    !data ||
    !data.services?.length ||
    !data.accomplishments?.length ||
    !data.realisationsUrl ||
    !data.ctaUrl
  ) {
    notFound();
  }

  const ctaBg = data.ctaPanelColor?.trim() || "#d4a574";

  return (
    <AppPageShell>
      <Header />

      <SectionHeader title={data.pageHeading?.trim() || "Agence"} />

      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-border">
        {data.services.map((service, index) => (
          <div
            key={`${service.title}-${index}`}
            className={`p-8 md:p-12 lg:p-16 border-b border-border ${
              index % 2 === 0 ? "md:border-r md:border-border" : ""
            }`}
          >
            <h3 className="font-display text-lg font-bold mb-3 uppercase tracking-wide">
              {service.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {service.description}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-[#1a1a1a] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase mb-8">
            {data.accomplishmentsHeading?.trim() || "Réalisations"}
          </h2>
          <div className="space-y-6">
            {data.accomplishments.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex justify-between items-center gap-4 border-b border-white/20 pb-4"
              >
                <span className="font-display font-bold">{item.name}</span>
                <span className="text-sm text-white/60">{item.client}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-square md:aspect-auto md:min-h-[500px] order-1 md:order-2">
          <Image
            src={data.realisationsUrl}
            alt={data.realisationsAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-border">
        <div className="relative aspect-square md:aspect-auto md:min-h-[400px]">
          <Image
            src={data.ctaUrl}
            alt={data.ctaAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div
          className="p-8 md:p-12 lg:p-16 flex flex-col justify-center"
          style={{ backgroundColor: ctaBg }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase mb-4 text-foreground">
            {data.ctaTitle}
          </h2>
          <p className="text-black/70 mb-8 leading-relaxed text-sm md:text-base whitespace-pre-line">
            {data.ctaIntro}
          </p>
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-black/50 mr-2">Email</span>
              <a
                href={`mailto:${data.contactEmail}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {data.contactEmail}
              </a>
            </p>
            <p>
              <span className="text-black/50 mr-2">Booking</span>
              <a
                href={`mailto:${data.bookingEmail}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {data.bookingEmail}
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </AppPageShell>
  );
}
