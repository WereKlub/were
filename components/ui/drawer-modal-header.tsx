"use client";

import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

interface DrawerModalHeaderProps {
  title: string;
  subtitle?: string;
  titleId?: string;
  showControls: boolean;
  onClose: () => void;
  onBack?: () => void;
  backLabel?: string;
}

export function DrawerModalHeader({
  title,
  subtitle,
  titleId,
  showControls,
  onClose,
  onBack,
  backLabel,
}: DrawerModalHeaderProps) {
  const { currentLanguage } = useTranslation();
  const resolvedBackLabel =
    backLabel ?? t(currentLanguage, "cartModal.backToCart");

  if (!showControls) {
    return (
      <div>
        <h2
          id={titleId}
          className="text-2xl md:text-3xl font-bold text-foreground"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="shrink-0">
      <div className="flex justify-center pb-3">
        <div className="h-1 w-10 rounded-full bg-border" aria-hidden="true" />
      </div>

      <div className="flex items-start gap-2">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="min-h-11 min-w-11 shrink-0 rounded-md"
            aria-label={resolvedBackLabel}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="min-w-11 shrink-0" aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            className="text-2xl font-bold text-foreground leading-tight"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          ) : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="min-h-11 min-w-11 shrink-0 rounded-md"
          aria-label={t(currentLanguage, "common.close")}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
