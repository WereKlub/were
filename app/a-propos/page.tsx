import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { PageIntro } from "@/components/layout/page-intro";
import { getAboutPage } from "@/lib/sanity/queries";
import { AppPageShell } from "@/components/layout/app-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutPage();
  return {
    title: data?.metaTitle ?? "À propos | Wêrê Klub",
    description:
      data?.metaDescription ??
      "Le collectif Wêrê Klub — musique et événements à Abidjan.",
  };
}

export default async function AProposPage() {
  const data = await getAboutPage();
  if (
    !data ||
    !data.heroUrl ||
    !data.teamSectionUrl ||
    !data.collectifBody ||
    !data.stats?.length ||
    !data.team?.length
  ) {
    notFound();
  }

  const collectifBg = data.collectifPanelColor?.trim() || "#7cb342";
  const teamBg = data.teamPanelColor?.trim() || "#e8b4bc";

  return (
    <AppPageShell>
      <Header />

      <PageIntro
        title={data.pageHeading?.trim() || "À propos"}
        subtitle={data.metaDescription?.trim() || undefined}
      />

      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-square md:aspect-auto md:min-h-[500px]">
          <Image
            src={data.heroUrl}
            alt={data.heroAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div
          className="p-8 md:p-12 lg:p-16 flex flex-col justify-center"
          style={{ backgroundColor: collectifBg }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase mb-6 text-white">
            {data.collectifTitle}
          </h2>
          <div className="space-y-4 text-white/90 leading-relaxed text-sm md:text-base prose prose-invert prose-p:mb-4 max-w-none">
            <PortableText value={data.collectifBody as never} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 border-t border-border">
        {data.stats.map((stat, index) => (
          <div
            key={`${stat.value}-${stat.label}-${index}`}
            className={`p-8 md:p-12 border-border text-center ${
              index === 0
                ? "border-r border-b md:border-b-0"
                : index === 1
                  ? "border-b md:border-b-0 md:border-r"
                  : index === 2
                    ? "border-r"
                    : ""
            }`}
          >
            <p className="font-display text-4xl md:text-5xl font-black">
              {stat.value}
            </p>
            <p className="mt-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-border">
        <div
          className="p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1"
          style={{ backgroundColor: teamBg }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase mb-8 text-foreground">
            {data.teamHeading?.trim() || "L'équipe"}
          </h2>
          <div className="space-y-4">
            {data.team.map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className="flex justify-between items-center gap-4 border-b border-foreground/10 pb-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {member.imageUrl ? (
                    <div className="relative size-10 shrink-0 rounded-full overflow-hidden border border-foreground/20">
                      <Image
                        src={member.imageUrl}
                        alt={member.imageAlt || member.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : null}
                  <span className="font-display font-bold truncate">
                    {member.name}
                  </span>
                </div>
                <span className="text-sm text-foreground/70 text-right shrink-0">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-square md:aspect-auto md:min-h-[400px] order-1 md:order-2">
          <Image
            src={data.teamSectionUrl}
            alt={data.teamSectionAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      <Footer />
    </AppPageShell>
  );
}
