import { client } from "../sanity/client";
import type { NewsPost, NewsAuthor } from "../types/news";

/** Shared GROQ projection for news documents */
const newsFields = `
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  "mainImage": mainImage {
    asset->,
    alt,
    caption
  },
  "author": author->{
    _id,
    name,
    "image": image{
      asset->,
      alt
    },
    bio
  },
  body
`;

const newsListFields = `
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  "mainImage": mainImage {
    asset->,
    alt,
    caption
  }
`;

const newsCacheTags = (slug?: string) =>
  slug ? ["news", `news-${slug}`] : ["news"];

export async function getAllNewsPosts(): Promise<NewsPost[]> {
  try {
    const query = `*[_type == "news" && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc) { ${newsFields} }`;
    const result = await client.fetch(
      query,
      {},
      { next: { tags: newsCacheTags() } },
    );
    return result || [];
  } catch (error) {
    console.error("Error in getAllNewsPosts:", error);
    return [];
  }
}

export async function getNewsPostBySlug(
  slug: string,
): Promise<NewsPost | null> {
  try {
    const query = `*[_type == "news" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0] { ${newsFields} }`;
    const result = await client.fetch(
      query,
      { slug },
      { next: { tags: newsCacheTags(slug) } },
    );
    return result || null;
  } catch (error) {
    console.error("Error in getNewsPostBySlug:", error);
    return null;
  }
}

export async function getFeaturedNewsPosts(limit = 3): Promise<NewsPost[]> {
  try {
    const query = `*[_type == "news"] | order(publishedAt desc)[0...${limit}] { ${newsListFields} }`;
    const result = await client.fetch(query);
    return result || [];
  } catch (error) {
    console.error("Error in getFeaturedNewsPosts:", error);
    return [];
  }
}

export async function getAllNewsAuthors(): Promise<NewsAuthor[]> {
  try {
    const query = `*[_type == "author"] | order(name asc) {
      _id,
      name,
      slug,
      "image": image {
        asset->,
        alt
      },
      bio
    }`;
    const result = await client.fetch(query);
    return result || [];
  } catch (error) {
    console.error("Error in getAllNewsAuthors:", error);
    return [];
  }
}
