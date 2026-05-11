/**
 * This configuration file contains shared Sanity settings
 * that can be used by both the Next.js frontend and the Sanity Studio.
 * Defaults match studio/sanity.config.ts so builds work when .env is not loaded
 * (e.g. CI). Override with NEXT_PUBLIC_* env vars for other projects/datasets.
 */

const DEFAULT_PROJECT_ID = "k05pnb0n";
const DEFAULT_DATASET = "production";
/** Pinned GROQ API version — must be non-empty for @sanity/client. */
const DEFAULT_API_VERSION = "2023-05-03";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || DEFAULT_PROJECT_ID;
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || DEFAULT_DATASET;
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || DEFAULT_API_VERSION;
