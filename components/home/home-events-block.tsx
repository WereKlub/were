"use client";

import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { SectionHeader } from "@/components/landing/section-header";
import { EventStackList } from "@/components/event/event-stack-list";
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

  const reserveLabel = t(currentLanguage, "eventsPage.reserve");
  const galleryLabel = t(currentLanguage, "eventsPage.viewGallery");

  return (
    <section id="events" className="border-t border-border/40 bg-background">
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
          <SectionHeader title={t(currentLanguage, "eventsPage.pastSection")} />
          <EventStackList
            events={pastCards}
            reserveLabel={reserveLabel}
            galleryLabel={galleryLabel}
          />
        </div>
      ) : null}
    </section>
  );
}
