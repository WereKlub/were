"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { trackPurchase } from "@/components/ui/FacebookPixel";
import { useEffect } from "react";
import { clearCheckoutContact } from "@/lib/utils/checkout-contact";
import {
  AppPageContainer,
  AppPageShell,
} from "@/components/layout/app-page-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { PageContentBelowIntro } from "@/components/layout/page-content-below-intro";
import { DetailSectionHeader } from "@/components/layout/detail-section-header";

interface PaymentSuccessClientProps {
  purchaseId?: string;
}

export function PaymentSuccessClient({
  purchaseId,
}: PaymentSuccessClientProps) {
  const { currentLanguage } = useTranslation();

  useEffect(() => {
    trackPurchase(0, "XOF");
    clearCheckoutContact();
  }, []);

  return (
    <AppPageShell>
      <Header />

      <PageIntro
        title={t(currentLanguage, "paymentSuccess.title")}
        subtitle={t(currentLanguage, "paymentSuccess.description")}
        bodyClassName="max-w-2xl md:max-w-3xl"
      />

      <PageContentBelowIntro>
        <AppPageContainer className="flex justify-center pb-16 pt-10 md:pb-20 md:pt-12">
          <div className="w-full max-w-lg">
            <div className="rounded-md border border-border/50 bg-card/50 p-8 shadow-lg backdrop-blur-sm md:p-10">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md border border-border bg-muted">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                {purchaseId ? (
                  <p className="rounded-md bg-muted p-3 font-mono text-sm text-foreground">
                    {t(currentLanguage, "paymentSuccess.orderId", {
                      orderId: purchaseId,
                    })}
                  </p>
                ) : null}
              </div>

              <DetailSectionHeader
                title={t(currentLanguage, "paymentSuccess.whatsNext.title")}
                className="mb-4"
              />
              <ul className="mb-8 space-y-2 text-sm text-muted-foreground">
                <li>
                  • {t(currentLanguage, "paymentSuccess.whatsNext.checkEmail")}
                </li>
                <li>
                  •{" "}
                  {t(currentLanguage, "paymentSuccess.whatsNext.presentTicket")}
                </li>
                <li>
                  • {t(currentLanguage, "paymentSuccess.whatsNext.arriveEarly")}
                </li>
              </ul>

              <div className="mb-6 flex flex-col gap-3">
                <Button variant="outline" asChild className="w-full rounded-md">
                  <Link href="/events">
                    {t(currentLanguage, "paymentSuccess.buttons.backToEvents")}
                  </Link>
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                {t(currentLanguage, "paymentSuccess.support")}
              </p>
            </div>
          </div>
        </AppPageContainer>
      </PageContentBelowIntro>

      <Footer />
    </AppPageShell>
  );
}
