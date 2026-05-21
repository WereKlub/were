import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import {
  getHomepageContent,
  getHomepagePromoEvent,
  getAllEventsForWereCards,
  getAllProducts,
} from "@/lib/sanity/queries";
import FloatingPromo from "@/components/landing/floating-promo";
import { WereHero } from "@/components/landing/were-hero";
import { buildWereEventLists } from "@/lib/sanity/were-events-list";
import { HomeEventsBlock } from "@/components/home/home-events-block";
import { HomeMerchGrid } from "@/components/home/home-merch-grid";
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
  const locale = await getServerLocale();
  const [homepageData, promoEventData, rawEvents, allProducts] =
    await Promise.all([
      getHomepageContent(),
      getHomepagePromoEvent(),
      getAllEventsForWereCards(),
      getAllProducts(),
    ]);

  const { upcomingCards, pastCards } = buildWereEventLists(rawEvents);

  const merchForHome = (allProducts || [])
    .filter((p: { stock?: number }) =>
      typeof p.stock === "number" ? p.stock > 0 : true,
    )
    .slice(0, 4);

  const heroImageItem = homepageData?.heroContent?.find(
    (h) => h.isActive && h.type === "image" && h.image?.asset?.url,
  );
  const heroImageUrl = heroImageItem?.image?.asset?.url ?? "/banner.webp";
  const heroImageAlt = heroImageItem?.image?.alt ?? "Wêrê Klub";

  return (
    <AppPageShell className="relative">
      <Header />
      <WereHero
        imageUrl={heroImageUrl}
        imageAlt={heroImageAlt}
        tagline={t(locale, "homePage.tagline")}
        subtitle={t(locale, "homePage.heroSubtitle")}
        byline={t(locale, "homePage.byline")}
      />

      <HomeEventsBlock upcomingCards={upcomingCards} pastCards={pastCards} />

      <HomeMerchGrid products={merchForHome} />
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
