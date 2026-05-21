"use client";

import { useTranslation } from "@/lib/contexts/TranslationContext";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { t } from "@/lib/i18n/translations";
import { SectionHeader } from "@/components/landing/section-header";
import { EventIndexGrid } from "@/components/event/event-index-grid";
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
            <>
              <SectionHeader
                title={t(currentLanguage, "eventsPage.upcomingSection")}
              />
              <EventIndexGrid events={upcomingCards} />
            </>
          ) : null}

          {pastCards.length > 0 ? (
            <>
              <SectionHeader
                title={t(currentLanguage, "eventsPage.pastSection")}
              />
              <EventIndexGrid events={pastCards} />
            </>
          ) : null}
        </PageContentBelowIntro>
      </div>
      <Footer />
    </AppPageShell>
  );
}
