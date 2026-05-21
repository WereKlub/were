"use client";

import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { SectionHeader } from "@/components/landing/section-header";
import { EventIndexGrid } from "@/components/event/event-index-grid";
import type { WereEventCard } from "@/components/event/were-event-card";
import { PageEmptyState } from "@/components/layout/page-empty-state";

export function HomeEventsBlock({
  upcomingCards,
  pastCards,
}: {
  upcomingCards: WereEventCard[];
  pastCards: WereEventCard[];
}) {
  const { currentLanguage } = useTranslation();

  if (upcomingCards.length === 0 && pastCards.length === 0) {
    return (
      <section id="events" className="border-t border-border/40">
        <PageEmptyState>
          {t(currentLanguage, "eventsPage.noEvents")}
        </PageEmptyState>
      </section>
    );
  }

  return (
    <section id="events" className="border-t border-border/40 bg-background">
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
          <SectionHeader title={t(currentLanguage, "eventsPage.pastSection")} />
          <EventIndexGrid events={pastCards} />
        </>
      ) : null}
    </section>
  );
}
