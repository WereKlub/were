import { client, clientNoCdn } from "./client";

// Events
export async function getLatestEvents(limit = 3) {
  return client.fetch(
    `
    *[_type == "event" && dateTime(date) >= dateTime(now())] | order(date asc) [0...$limit] {
      _id,
      title,
      slug,
      date,
      "date": dateTime(date),
      "time": coalesce(time, "TBD"),
      "location": coalesce(location, "TBD"),
      "flyer": {
        "url": flyer.asset->url
      },
      ticketsAvailable
    }
  `,
    { limit },
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ["events"],
      },
    },
  );
}

export const getAllEvents = async (): Promise<Event[]> => {
  const query = `*[_type == "event"] | order(date desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    time,
    location,
    "flyer": flyer.asset->{url},
    ticketsAvailable
  }`;
  return await client.fetch(query);
};

export async function getEventBySlug(slug: string, locale: string) {
  const event = await client.fetch(
    `
    *[_type == "event" && slug.current == $slug][0] {
      _id,
      title,
      subtitle,
      number,
      slug,
      date,
      "dateFormatted": dateTime(date),
      "time": coalesce(time, "TBD"),
      "location": location,
      "flyer": {
        "url": flyer.asset->url
      },
      "description": coalesce(description[$locale], description.en),
      "venueDetails": coalesce(venueDetails[$locale], venueDetails.en),
      hostedBy,
      ticketsAvailable,
      paymentLink,
      paymentProductId,
      ticketTypes[]{
        _key,
        name,
        price,
        description,
        details,
        stock,
        maxPerOrder,
        paymentLink,
        salesStart,
        salesEnd,
        active,
        productId,
        priceId
      },
      lineup[]->{
        _id,
        name,
        bio,
        "image": image.asset->url,
        socialLink,
        isResident
      },
      gallery[]{
        _key,
        "url": asset->url,
        "caption": caption,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      },
      bundles[]{
        _key,
        name,
        price,
        description,
        details,
        stock,
        active,
        paymentLink,
        salesStart,
        salesEnd,
        maxPerOrder,
        productId,
        priceId,
        ticketsIncluded
      }
    }
  `,
    { slug, locale },
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: [`event-${slug}`, "events"],
      },
    },
  );

  return event;
}

// Helper function to get cache configuration based on environment
const getCacheConfig = (tags: string[]) => ({
  next: {
    revalidate: 0, // Disable ISR caching for now to avoid issues
    tags,
  },
});

export interface AboutPageData {
  metaTitle?: string;
  metaDescription?: string;
  panelColor?: string;
  panelTextColor?: string;
  carouselImages: { url: string; alt: string }[];
  introLabel?: string;
  heading: string;
  body: unknown;
  stats: { value: string; label: string }[];
  teamHeading?: string;
  team: {
    name: string;
    role: string;
    imageUrl?: string | null;
    imageAlt?: string;
  }[];
}

export async function getAboutPage(): Promise<AboutPageData | null> {
  const query = `*[_type == "aboutPage"] | order(_updatedAt desc) [0] {
    metaTitle,
    metaDescription,
    panelColor,
    panelTextColor,
    "carouselImages": carouselImages[]{
      "url": asset->url,
      "alt": coalesce(alt, "")
    },
    introLabel,
    heading,
    body,
    stats[]{ value, label },
    teamHeading,
    team[]{
      name,
      role,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    }
  }`;
  return client.fetch<AboutPageData | null>(
    query,
    {},
    getCacheConfig(["aboutPage"]),
  );
}

export interface AgencyPageData {
  metaTitle?: string;
  metaDescription?: string;
  panelColor?: string;
  panelTextColor?: string;
  carouselImages: { url: string; alt: string }[];
  introLabel?: string;
  heading: string;
  body: unknown;
  missionHeading?: string;
  missionBody?: string;
  logosIntro?: string;
  logoBoxLabel?: string;
  partnerLogos: {
    name: string;
    logoUrl: string;
    logoAlt: string;
    url?: string | null;
  }[];
  contactEmail?: string;
  bookingEmail?: string;
}

export async function getAgencyPage(): Promise<AgencyPageData | null> {
  const query = `*[_type == "agencyPage"] | order(_updatedAt desc) [0] {
    metaTitle,
    metaDescription,
    panelColor,
    panelTextColor,
    "carouselImages": carouselImages[]{
      "url": asset->url,
      "alt": coalesce(alt, "")
    },
    introLabel,
    heading,
    body,
    missionHeading,
    missionBody,
    logosIntro,
    logoBoxLabel,
    partnerLogos[]{
      name,
      "logoUrl": logo.asset->url,
      "logoAlt": coalesce(logo.alt, name),
      url
    },
    contactEmail,
    bookingEmail
  }`;
  return client.fetch<AgencyPageData | null>(
    query,
    {},
    getCacheConfig(["agencyPage"]),
  );
}

function isPortableBlocks(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

/** Matches /about: show nav link only when CMS has at least one visible block. */
export function shouldShowAboutInNavigation(
  data: AboutPageData | null,
): boolean {
  if (!data) return false;
  const hasCarousel = (data.carouselImages?.length ?? 0) > 0;
  const hasCopy = Boolean(data.heading?.trim()) && isPortableBlocks(data.body);
  return hasCarousel || hasCopy;
}

/** Matches /agency: show nav link only when CMS has at least one visible block. */
export function shouldShowAgencyInNavigation(
  data: AgencyPageData | null,
): boolean {
  if (!data) return false;
  const hasCarousel = (data.carouselImages?.length ?? 0) > 0;
  const hasCopy = Boolean(data.heading?.trim()) && isPortableBlocks(data.body);
  const hasLogos = (data.partnerLogos?.length ?? 0) > 0;
  return hasCarousel || hasCopy || hasLogos;
}

// Products (Enhanced Section)
export async function getAllProducts() {
  try {
    const result = await client.fetch(
      `
      *[_type == "product"] | order(name asc) {
        _id,
        name,
        "slug": slug.current,
        "mainImage": images[0].asset->url,
        "price": basePrice,
        "stock": baseStock,
        description,
        "categories": categories[]->{
          _id,
          title,
          "slug": slug.current
        },
        tags,
        "colors": coalesce(
          colors[]{
            name,
            "image": image.asset->url,
            available
          },
          [
            { "name": "Noir", "image": null, "available": true },
            { "name": "Blanc", "image": null, "available": true }
          ]
        ),
        "sizes": coalesce(
          sizes[]{name, available},
          [
            { "name": "S", "available": true },
            { "name": "M", "available": true },
            { "name": "L", "available": true },
            { "name": "XL", "available": true }
          ]
        ),
        images[]{
          asset->{url},
          alt,
          caption
        }
      }
    `,
      {},
      getCacheConfig(["products"]),
    );
    return result;
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return empty array as fallback
  }
}

export async function getProductBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      "name": name,
      "slug": slug.current,
      "mainImage": images[0].asset->url,
      description,
      "images": images[]{
        asset->{url},
        alt,
        caption
      },
      "price": basePrice,
      "stock": baseStock,
      "colors": coalesce(
        colors[]{
          name,
          "image": image.asset->url,
          available
        },
        [
          { "name": "Noir", "image": null, "available": true },
          { "name": "Blanc", "image": null, "available": true }
        ]
      ),
      "sizes": coalesce(
        sizes[]{name, available},
        [
          { "name": "S", "available": true },
          { "name": "M", "available": true },
          { "name": "L", "available": true },
          { "name": "XL", "available": true }
        ]
      ),
      "categories": categories[]->{
        title,
        "slug": slug.current
      },
      tags
    }
  `,
    { slug },
    getCacheConfig([`product-${slug}`, "products"]),
  );
}

// ================================= Shipping ================================
export interface ShippingSettings {
  defaultShippingCost: number;
}

export const getShippingSettings = async (): Promise<ShippingSettings> => {
  try {
    // Use most recently updated homepage (same pattern as getNavigationSettings)
    const query = `*[_type == "homepage"] | order(_updatedAt desc) [0] {
      defaultShippingCost
    }`;

    const result = await client.fetch<{ defaultShippingCost?: number }>(
      query,
      {},
      getCacheConfig(["homepage", "settings"]),
    );
    return {
      defaultShippingCost: result?.defaultShippingCost ?? 0,
    };
  } catch (error) {
    console.error("Error fetching shipping settings:", error);
    return {
      defaultShippingCost: 0, // Return default value
    };
  }
};

// ================================= Navigation Settings ================================
export interface NavigationSettings {
  showBlogInNavigation?: boolean;
  showBoutiqueInNavigation?: boolean;
  showAboutInNavigation?: boolean;
  showAgencyInNavigation?: boolean;
}

export const getNavigationSettings = async (): Promise<NavigationSettings> => {
  try {
    const homeQuery = `*[_type == "homepage"] | order(_updatedAt desc) [0] {
      showBlogInNavigation,
      showBoutiqueInNavigation,
    }`;
    const [result, aboutData, agencyData] = await Promise.all([
      clientNoCdn.fetch<
        Pick<
          NavigationSettings,
          "showBlogInNavigation" | "showBoutiqueInNavigation"
        >
      >(homeQuery, {}, getCacheConfig(["homepage", "navigation"])),
      getAboutPage(),
      getAgencyPage(),
    ]);
    const showBlog =
      result?.showBlogInNavigation === undefined
        ? true
        : Boolean(result.showBlogInNavigation);
    const showBoutique =
      result?.showBoutiqueInNavigation === undefined
        ? true
        : Boolean(result.showBoutiqueInNavigation);
    return {
      showBlogInNavigation: showBlog,
      showBoutiqueInNavigation: showBoutique,
      showAboutInNavigation: shouldShowAboutInNavigation(aboutData),
      showAgencyInNavigation: shouldShowAgencyInNavigation(agencyData),
    };
  } catch (error) {
    console.error("Error fetching navigation settings:", error);
    return {
      showBlogInNavigation: true,
      showBoutiqueInNavigation: true,
      showAboutInNavigation: false,
      showAgencyInNavigation: false,
    };
  }
};

// ================================= Theme / Button Color ================================
export interface HomepageThemeSettings {
  primaryButtonColor: string;
}

export const getHomepageThemeSettings =
  async (): Promise<HomepageThemeSettings> => {
    try {
      const query = `*[_type == "homepage"][0] {
        primaryButtonColor,
      }`;
      const result = await client.fetch<{ primaryButtonColor?: string }>(
        query,
        {},
        getCacheConfig(["homepage", "settings"]),
      );
      return {
        primaryButtonColor: result?.primaryButtonColor ?? "teal",
      };
    } catch (error) {
      console.error("Error fetching theme settings:", error);
      return { primaryButtonColor: "teal" };
    }
  };

export interface HomepageHeroItem {
  _key: string;
  title?: string;
  description?: string;
  type: "image" | "video";
  image?: {
    asset?: { url?: string };
    alt?: string;
  };
  video?: {
    asset?: { url?: string };
  };
  videoUrl?: string;
  isActive?: boolean;
}

export async function getHomepageHeroContent(): Promise<HomepageHeroItem[]> {
  try {
    const query = `*[_type == "homepage"] | order(_updatedAt desc) [0] {
      "heroContent": heroContent[
        isActive != false && (
          (coalesce(type, "image") == "image" && defined(image.asset)) ||
          (type == "video" && (defined(video.asset) || defined(videoUrl)))
        )
      ]{
        _key,
        title,
        description,
        type,
        image{
          asset->{url},
          alt
        },
        video{
          asset->{url}
        },
        videoUrl,
        isActive
      }
    }`;

    const result = await client.fetch<{ heroContent?: HomepageHeroItem[] }>(
      query,
      {},
      getCacheConfig(["homepage"]),
    );

    return result?.heroContent ?? [];
  } catch (error) {
    console.error("Error fetching homepage hero content:", error);
    return [];
  }
}

export interface SanityEventCardSource {
  _id: string;
  slug: string | null;
  title: string;
  subtitle?: string;
  date: string;
  location?: {
    venueName?: string;
    address?: string;
  };
  flyerUrl?: string | null;
  cardBackgroundColor?: string | null;
  cardTextColor?: string | null;
  lineup?: { name?: string }[];
  ticketTypes?: { name?: string; price?: number; active?: boolean }[];
  cardPricing?: {
    preventeAmount?: number;
    surPlaceAmount?: number;
    surPlaceConsos?: number;
    surPlaceLabel?: string;
  };
  ticketsAvailable?: boolean;
  /** From `count(gallery)` — used for past-event links to on-page gallery */
  galleryCount?: number;
}

export async function getAllEventsForWereCards(): Promise<
  SanityEventCardSource[]
> {
  try {
    const query = `*[_type == "event"] | order(date desc) {
      _id,
      "slug": slug.current,
      title,
      subtitle,
      date,
      location,
      "flyerUrl": flyer.asset->url,
      cardBackgroundColor,
      cardTextColor,
      "lineup": lineup[]->{name},
      ticketTypes[]{name, price, active},
      cardPricing,
      ticketsAvailable,
      "galleryCount": count(gallery)
    }`;
    const result = await client.fetch<SanityEventCardSource[] | null>(
      query,
      {},
      getCacheConfig(["events"]),
    );
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error fetching events for cards:", error);
    return [];
  }
}

// Define interface for the data returned by getEventsForScroller
interface EventScrollerData {
  _id: string;
  title: string;
  slug: string;
  featuredImage: string; // Matches the alias in the query
  date?: string; // Matches the optional date field in the query
  description?: string; // Add description field
  ticketsAvailable?: boolean; // <-- Add this field
  number?: string; // <-- Add number field (now string to support alphanumeric)
}

// New query for ImageScroller
export const getEventsForScroller = async (
  limit = 10,
): Promise<EventScrollerData[]> => {
  // Use the specific interface
  const query = `*[_type == "event"] | order(date desc) [0...$limit] {
    _id,
    title,
    "slug": slug.current,
    "featuredImage": flyer.asset->url, // Alias flyer URL as featuredImage
    date, // Keep date for potential use in scroller UI
    description, // Fetch the description
    ticketsAvailable, // <-- Add this field to the query
    number // <-- Add number field to the query
    // Add other fields if ImageScroller is adapted to show them
  }`;
  // Use the specific interface in the fetch call as well for better type safety
  return await client.fetch<EventScrollerData[]>(query, { limit });
};

// ================================= Homepage Promo Event ================================
interface HomepagePromoEventData {
  slug?: string;
  flyerUrl?: string;
  title?: string; // Added for potential use, e.g. alt text or title attribute
}

export const getHomepagePromoEvent =
  async (): Promise<HomepagePromoEventData | null> => {
    const query = `*[_type == "homepage"][0] {
    promoEvent->{
      "slug": slug.current,
      "flyerUrl": flyer.asset->url,
      title
    }
  }`;
    const result = await client.fetch<{ promoEvent?: HomepagePromoEventData }>(
      query,
      {},
      {
        next: {
          revalidate: 3600, // Cache for 1 hour
          tags: ["homepage", "events"],
        },
      },
    );
    return result?.promoEvent ?? null;
  };
