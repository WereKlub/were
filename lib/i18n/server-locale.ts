import { cookies } from "next/headers";
import type { Language } from "@/lib/i18n/config";
import { languages, LOCALE_COOKIE_NAME } from "@/lib/i18n/config";

/** Locale for server components (Sanity CMS fields, metadata). */
export async function getServerLocale(): Promise<Language> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (value && languages.some((lang) => lang.code === value)) {
    return value as Language;
  }
  const fallback = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en";
  return languages.some((lang) => lang.code === fallback)
    ? (fallback as Language)
    : "en";
}
