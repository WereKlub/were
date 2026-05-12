"use client";

import { useTranslation } from "@/lib/contexts/TranslationContext";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { t } from "@/lib/i18n/translations";
import { SectionHeader } from "@/components/landing/section-header";
import { EventIndexGrid } from "@/components/event/event-index-grid";
import type { WereEventCard as WereEventCardModel } from "@/components/event/were-event-card";
import { PageIntro } from "@/components/layout/page-intro";
import {
  AppPageContainer,
  AppPageShell,
} from "@/components/layout/app-page-shell";

interface EventsPageContentProps {
  upcomingCards: WereEventCardModel[];
  pastCards: WereEventCardModel[];
}

export default function EventsPageContent({
  upcomingCards,
  pastCards,
}: EventsPageContentProps) {
  const { currentLanguage } = useTranslation();

  if (upcomingCards.length === 0 && pastCards.length === 0) {
    return (
      <AppPageShell>
        <Header />
        <div className="flex flex-col grow">
          <PageIntro
            title={t(currentLanguage, "eventsPage.title")}
            subtitle={t(currentLanguage, "eventsPage.noEvents")}
          />
        </div>
        <Footer />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell>
      <Header />
      <div className="flex flex-col grow min-w-0" id="events">
        <AppPageContainer className="pt-12 md:pt-16 pb-4">
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-balance">
            {t(currentLanguage, "eventsPage.title")}
          </h1>
        </AppPageContainer>
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
      </div>
      <Footer />
    </AppPageShell>
  );
}
