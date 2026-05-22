import Header from "@/components/landing/header";
import { buildPageMetadata } from "@/lib/site-metadata";
import Footer from "@/components/landing/footer";
import { getAboutPage } from "@/lib/sanity/queries";
import { resolvePanelColorCss } from "@/lib/theme/colorPresets";
import { AppPageShell } from "@/components/layout/app-page-shell";
import { SplitShowcaseLayout } from "@/components/layout/split-showcase-layout";
import { AboutShowcasePanel } from "@/components/about/about-showcase-panel";
import { PageEmptyState } from "@/components/layout/page-empty-state";

export async function generateMetadata() {
  const data = await getAboutPage();
  return buildPageMetadata({
    title: data?.metaTitle ?? "À propos | Wêrê Klub",
    description:
      data?.metaDescription ??
      "Collectif artistique fondé par Soumia et Lucie. DJs passionnées, soirées Wêrê et culture club ouverte à Abidjan.",
    path: "/about",
  });
}

function isPortableBlocks(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

export default async function AboutPage() {
  const data = await getAboutPage();

  const panelColor = resolvePanelColorCss(data?.panelColor, "lime-500");
  const carouselImages = (data?.carouselImages ?? []).filter((img) =>
    Boolean(img.url),
  );
  const hasContent =
    carouselImages.length > 0 ||
    (Boolean(data?.heading?.trim()) && isPortableBlocks(data?.body)) ||
    (data?.stats?.length ?? 0) > 0 ||
    (data?.team?.length ?? 0) > 0;

  return (
    <AppPageShell>
      <Header />

      {!hasContent ? (
        <PageEmptyState>
          Le contenu de cette page sera affiché ici lorsqu’un document{" "}
          <strong className="text-foreground">About page (À propos)</strong>{" "}
          sera créé et <strong className="text-foreground">publié</strong> dans
          Sanity Studio.
        </PageEmptyState>
      ) : (
        <SplitShowcaseLayout images={carouselImages} panelColor={panelColor}>
          <AboutShowcasePanel
            introLabel={data?.introLabel}
            heading={data?.heading?.trim() || "À propos"}
            body={data?.body}
            stats={data?.stats ?? []}
            teamHeading={data?.teamHeading}
            team={data?.team ?? []}
          />
        </SplitShowcaseLayout>
      )}

      <Footer />
    </AppPageShell>
  );
}
