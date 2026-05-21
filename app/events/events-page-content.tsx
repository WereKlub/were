"use client";

import { useTranslation } from "@/lib/contexts/TranslationContext";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { t } from "@/lib/i18n/translations";
import { SectionHeader } from "@/components/landing/section-header";
import { EventStackList } from "@/components/event/event-stack-list";
import type { WereEventCard as WereEventCardModel } from "@/components/event/were-event-card";
import { PageIntro } from "@/components/layout/page-intro";
import { PageContentBelowIntro } from "@/components/layout/page-content-below-intro";
import { PageEmptyState } from "@/components/layout/page-empty-state";
import { AppPageShell } from "@/components/layout/app-page-shell";

interface EventsPageContentProps {
  upcomingCards: WereEventCardModel[];
  pastCards: WereEventCardModel[];
}

export default function EventsPageContent({
  upcomingCards,
  pastCards,
}: EventsPageContentProps) {
  const { currentLanguage } = useTranslation();
  const hasAnyEvents = upcomingCards.length > 0 || pastCards.length > 0;
  const reserveLabel = t(currentLanguage, "eventsPage.reserve");
  const galleryLabel = t(currentLanguage, "eventsPage.viewGallery");

  return (
    <AppPageShell>
      <Header />
      <div className="flex flex-col grow min-w-0" id="events">
        <PageIntro
          title={t(currentLanguage, "eventsPage.title")}
          subtitle={
            hasAnyEvents ? t(currentLanguage, "eventsPage.subtitle") : undefined
          }
        />

        <PageContentBelowIntro>
          {!hasAnyEvents ? (
            <PageEmptyState>
              {t(currentLanguage, "eventsPage.noEvents")}
            </PageEmptyState>
          ) : null}

          {upcomingCards.length > 0 ? (
            <div>
              <SectionHeader
                title={t(currentLanguage, "eventsPage.upcomingSection")}
              />
              <EventStackList
                events={upcomingCards}
                reserveLabel={reserveLabel}
                galleryLabel={galleryLabel}
              />
            </div>
          ) : null}

          {upcomingCards.length > 0 && pastCards.length > 0 ? (
            <div
              className="h-px bg-border/60"
              role="separator"
              aria-hidden
            />
          ) : null}

          {pastCards.length > 0 ? (
            <div>
              <SectionHeader
                title={t(currentLanguage, "eventsPage.pastSection")}
              />
              <EventStackList
                events={pastCards}
                reserveLabel={reserveLabel}
                galleryLabel={galleryLabel}
              />
            </div>
          ) : null}
        </PageContentBelowIntro>
      </div>
      <Footer />
    </AppPageShell>
  );
}
