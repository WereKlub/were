"use client";

import { CheckCircle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { trackPurchase } from "@/components/ui/FacebookPixel";
import { useEffect } from "react";
import {
  AppPageContainer,
  AppPageShell,
} from "@/components/layout/app-page-shell";

interface PaymentSuccessClientProps {
  purchaseId?: string;
}

export function PaymentSuccessClient({
  purchaseId,
}: PaymentSuccessClientProps) {
  const { currentLanguage } = useTranslation();

  // Track purchase completion
  useEffect(() => {
    // Track successful purchase - you can enhance this with actual purchase value
    trackPurchase(0, "XOF"); // Replace 0 with actual purchase amount when available
  }, []);

  return (
    <AppPageShell>
      <Header />
      <div className="flex flex-col grow justify-center py-12">
        <AppPageContainer className="flex justify-center">
          <div className="max-w-md w-full">
          <Card className="border-border">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-sm flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl font-display text-foreground">
                {t(currentLanguage, "paymentSuccess.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-muted-foreground">
                <p>{t(currentLanguage, "paymentSuccess.description")}</p>
                {purchaseId && (
                  <p className="text-sm mt-2 font-mono bg-muted p-2 rounded-sm text-foreground">
                    {t(currentLanguage, "paymentSuccess.orderId", {
                      orderId: purchaseId,
                    })}
                  </p>
                )}
              </div>

              <div className="rounded-sm border border-border bg-muted/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-5 h-5 text-accent shrink-0" />
                  <h3 className="font-semibold text-foreground">
                    {t(currentLanguage, "paymentSuccess.whatsNext.title")}
                  </h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    •{" "}
                    {t(currentLanguage, "paymentSuccess.whatsNext.checkEmail")}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      currentLanguage,
                      "paymentSuccess.whatsNext.presentTicket",
                    )}
                  </li>
                  <li>
                    •{" "}
                    {t(currentLanguage, "paymentSuccess.whatsNext.arriveEarly")}
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/gallery">
                    {t(currentLanguage, "paymentSuccess.buttons.browseGallery")}
                  </Link>
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                {t(currentLanguage, "paymentSuccess.support")}
              </div>
            </CardContent>
          </Card>
          </div>
        </AppPageContainer>
      </div>
      <Footer />
    </AppPageShell>
  );
}
