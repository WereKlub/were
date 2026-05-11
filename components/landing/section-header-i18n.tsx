"use client";

import { SectionHeader } from "@/components/landing/section-header";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

export function SectionHeaderI18n({ translationKey }: { translationKey: string }) {
  const { currentLanguage } = useTranslation();
  return <SectionHeader title={t(currentLanguage, translationKey)} />;
}
