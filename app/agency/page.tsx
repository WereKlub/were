import Header from "@/components/landing/header";
import { buildPageMetadata } from "@/lib/site-metadata";
import Footer from "@/components/landing/footer";
import { getAgencyPage } from "@/lib/sanity/queries";
import { AppPageShell } from "@/components/layout/app-page-shell";
import { SplitShowcaseLayout } from "@/components/layout/split-showcase-layout";
import { AgencyShowcasePanel } from "@/components/agency/agency-showcase-panel";
import { PageEmptyState } from "@/components/layout/page-empty-state";

export async function generateMetadata() {
  const data = await getAgencyPage();
  return buildPageMetadata({
    title: data?.metaTitle ?? "Agence | Wêrê Klub",
    description:
      data?.metaDescription ??
      "Production événementielle, direction artistique et booking. Le collectif Wêrê Klub crée des espaces hybrides où musique et arts visuels se rencontrent.",
    path: "/agency",
  });
}

function isPortableBlocks(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

export default async function AgencyPage() {
  const data = await getAgencyPage();

  const panelColor = data?.panelColor?.trim() || "#9DB7A8";
  const carouselImages = (data?.carouselImages ?? []).filter((img) =>
    Boolean(img.url),
  );
  const partnerLogos = (data?.partnerLogos ?? []).filter((logo) =>
    Boolean(logo.logoUrl),
  );
  const hasContent =
    carouselImages.length > 0 ||
    (Boolean(data?.heading?.trim()) && isPortableBlocks(data?.body)) ||
    partnerLogos.length > 0;

  return (
    <AppPageShell>
      <Header />

      {!hasContent ? (
        <PageEmptyState>
          Le contenu de cette page sera affiché ici lorsqu’un document{" "}
          <strong className="text-foreground">Agency page</strong> sera créé et{" "}
          <strong className="text-foreground">publié</strong> dans Sanity
          Studio.
        </PageEmptyState>
      ) : (
        <SplitShowcaseLayout images={carouselImages} panelColor={panelColor}>
          <AgencyShowcasePanel
            introLabel={data?.introLabel}
            heading={data?.heading?.trim() || "Agence"}
            body={data?.body}
            missionHeading={data?.missionHeading}
            missionBody={data?.missionBody}
            logosIntro={data?.logosIntro}
            logoBoxLabel={data?.logoBoxLabel}
            partnerLogos={partnerLogos}
            contactEmail={data?.contactEmail}
            bookingEmail={data?.bookingEmail}
          />
        </SplitShowcaseLayout>
      )}

      <Footer />
    </AppPageShell>
  );
}
