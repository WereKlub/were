import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/sanity/queries";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildPageMetadata } from "@/lib/site-metadata";
import EventPageContent from "./event-page-content";

// Define specific type for TicketType
interface TicketTypeData {
  _key: string;
  name: string;
  price: number;
  description?: string;
  details?: string;
  stock?: number | null;
  maxPerOrder?: number;
  salesStart?: string | null;
  salesEnd?: string | null;
  paymentLink?: string;
  active: boolean;
  productId?: string;
}

// Define specific type for Bundle
interface BundleData {
  _key: string;
  name: string;
  bundleId: { current: string };
  price: number;
  description?: string;
  details?: string;
  stock?: number | null;
  paymentLink?: string;
  active: boolean;
  salesStart?: string | null;
  salesEnd?: string | null;
  maxPerOrder?: number;
  productId?: string;
  ticketsIncluded?: number;
}

// Updated EventData type
type EventData = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  date: string;
  location?: {
    venueName?: string;
    address?: string;
    googleMapsUrl?: string;
    yangoUrl?: string;
  };
  flyer?: { url: string };
  description?: string;
  venueDetails?: string;
  hostedBy?: string;
  ticketsAvailable?: boolean;
  ticketTypes?: TicketTypeData[];
  bundles?: BundleData[];
  lineup?: {
    _id: string;
    name: string;
    bio?: string;
    image?: string;
    socialLink?: string;
    isResident?: boolean;
  }[];
  gallery?: {
    _key: string;
    url: string;
    caption?: string;
    width?: number;
    height?: number;
  }[];
};

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}) {
  const params = await paramsPromise;
  const { slug } = params;
  const locale = await getServerLocale();
  const event: EventData | null = await getEventBySlug(slug, locale);

  if (!event) {
    return { title: "Event Not Found" };
  }

  return buildPageMetadata({
    title: event.title,
    description: event.subtitle || event.description,
    path: `/events/${slug}`,
    imageUrl: event.flyer?.url,
    imageAlt: event.title,
  });
}

export default async function EventPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}) {
  const params = await paramsPromise;
  const { slug } = params;
  const locale = await getServerLocale();
  const event: EventData | null = await getEventBySlug(slug, locale);

  if (!event) {
    notFound();
  }

  return <EventPageContent event={event} />;
}
