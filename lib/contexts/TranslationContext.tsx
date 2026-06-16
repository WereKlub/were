"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Language } from "@/lib/i18n/config";
import { languages, LOCALE_COOKIE_NAME } from "@/lib/i18n/config";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/lib/utils/localStorage";

interface TranslationContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: "en",
  setLanguage: () => {},
});

// Main provider component
export function TranslationProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(initialLanguage);

  useEffect(() => {
    const savedLanguage = getLocalStorageItem("jumbo.language");

    if (
      savedLanguage &&
      languages.some((lang) => lang.code === savedLanguage)
    ) {
      if (savedLanguage !== currentLanguage) {
        setCurrentLanguage(savedLanguage as Language);
      }
      if (typeof document !== "undefined") {
        document.cookie = `${LOCALE_COOKIE_NAME}=${savedLanguage};path=/;max-age=31536000;SameSite=Lax`;
      }
      return;
    }

    if (typeof navigator !== "undefined") {
      const browserLang = navigator.language.split("-")[0];
      if (
        languages.some((lang) => lang.code === browserLang) &&
        browserLang !== currentLanguage
      ) {
        setCurrentLanguage(browserLang as Language);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    setLocalStorageItem("jumbo.language", lang);
    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE_NAME}=${lang};path=/;max-age=31536000;SameSite=Lax`;
    }
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Hook component
export function useTranslation() {
  const context = useContext(TranslationContext);

  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context;
}
