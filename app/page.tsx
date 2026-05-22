import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import {
  getHomepagePromoEvent,
  getHomepageHeroContent,
  getAllEventsForWereCards,
} from "@/lib/sanity/queries";
import FloatingPromo from "@/components/landing/floating-promo";
import { buildWereEventLists } from "@/lib/sanity/were-events-list";
import { HomeEventsBlock } from "@/components/home/home-events-block";
import { HomeHeroCarousel } from "@/components/home/home-hero-carousel";
import { mapHomepageHeroItems } from "@/lib/sanity/home-hero";
import { AppPageShell } from "@/components/layout/app-page-shell";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { t } from "@/lib/i18n/translations";
import { buildPageMetadata } from "@/lib/site-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata({
    title: "Wêrê Klub | Amour et boucan",
    description: t(locale, "homePage.heroSubtitle"),
    path: "/",
  });
}

export default async function Home() {
  const [promoEventData, heroContent, rawEvents] = await Promise.all([
    getHomepagePromoEvent(),
    getHomepageHeroContent(),
    getAllEventsForWereCards(),
  ]);

  const { upcomingCards, pastCards } = buildWereEventLists(rawEvents);
  const heroItems = mapHomepageHeroItems(heroContent);

  return (
    <AppPageShell className="relative">
      <Header />

      {heroItems.length > 0 ? <HomeHeroCarousel items={heroItems} /> : null}

      <HomeEventsBlock upcomingCards={upcomingCards} pastCards={pastCards} />

      <Footer />

      {promoEventData && promoEventData.flyerUrl && promoEventData.slug && (
        <FloatingPromo
          imageUrl={promoEventData.flyerUrl}
          href={`/events/${promoEventData.slug}`}
          title={promoEventData.title || "View Event"}
        />
      )}
    </AppPageShell>
  );
}
