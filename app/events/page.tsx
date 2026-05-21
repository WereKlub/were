import { getAllEventsForWereCards } from "@/lib/sanity/queries";
import { buildWereEventLists } from "@/lib/sanity/were-events-list";
import EventsPageContent from "./events-page-content";
import { t } from "@/lib/i18n/translations";
import { buildPageMetadata } from "@/lib/site-metadata";

const getPageLocale = (params?: { locale?: string }): string => {
  return params?.locale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en";
};

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const params = await paramsPromise;
  const currentLanguage = getPageLocale(params);
  return buildPageMetadata({
    title: t(currentLanguage, "eventsPage.metadata.title"),
    description: t(currentLanguage, "eventsPage.metadata.description"),
    path: "/events",
  });
}

export default async function EventsPage() {
  const raw = await getAllEventsForWereCards();
  const { upcomingCards, pastCards } = buildWereEventLists(raw);
  return (
    <EventsPageContent upcomingCards={upcomingCards} pastCards={pastCards} />
  );
}
