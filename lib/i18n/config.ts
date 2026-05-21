export const LOCALE_COOKIE_NAME = "wereklub.language";

export const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export type Language = (typeof languages)[number]["code"];
