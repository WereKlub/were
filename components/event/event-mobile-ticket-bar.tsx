"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

interface TicketLike {
  price: number;
  active?: boolean;
}

interface EventMobileTicketBarProps {
  visible: boolean;
  cheapestPrice: number | null;
}

const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
};

export function getCheapestTicketPrice(
  ticketTypes?: TicketLike[],
  bundles?: TicketLike[],
): number | null {
  const prices = [...(ticketTypes ?? []), ...(bundles ?? [])]
    .filter((item) => item.active !== false)
    .map((item) => item.price)
    .filter((price) => typeof price === "number" && price >= 0);

  if (prices.length === 0) return null;
  return Math.min(...prices);
}

export function EventMobileTicketBar({
  visible,
  cheapestPrice,
}: EventMobileTicketBarProps) {
  const { currentLanguage } = useTranslation();

  if (!visible || cheapestPrice == null) return null;

  const scrollToTickets = () => {
    document.getElementById("event-tickets")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 px-4 md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          {t(currentLanguage, "eventMobileTicketBar.label", {
            price: formatPrice(cheapestPrice),
          })}
        </p>
        <Button
          type="button"
          size="sm"
          className="min-h-11 shrink-0 rounded-md uppercase tracking-wide"
          onClick={scrollToTickets}
        >
          {t(currentLanguage, "eventMobileTicketBar.cta")}
        </Button>
      </div>
    </div>
  );
}
