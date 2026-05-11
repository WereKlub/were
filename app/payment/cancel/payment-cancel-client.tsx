"use client";

import { XCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import {
  AppPageContainer,
  AppPageShell,
} from "@/components/layout/app-page-shell";

interface PaymentCancelClientProps {
  purchaseId?: string;
  flow?: string;
}

export function PaymentCancelClient({
  purchaseId,
  flow,
}: PaymentCancelClientProps) {
  const { currentLanguage } = useTranslation();

  // Default to ticket copy if flow is not provided or unknown
  const translationBaseKey =
    flow === "merch" ? "paymentCancelMerch" : "paymentCancel";

  return (
    <AppPageShell>
      <Header />
      <div className="flex flex-col grow justify-center py-12">
        <AppPageContainer className="flex justify-center">
          <div className="max-w-md w-full">
          <Card className="border-border">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-sm flex items-center justify-center mb-4 border border-border">
                <XCircle className="w-8 h-8 text-amber-700 dark:text-amber-500" />
              </div>
              <CardTitle className="text-2xl font-display text-foreground">
                {t(currentLanguage, `${translationBaseKey}.title`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-muted-foreground">
                <p>{t(currentLanguage, `${translationBaseKey}.description`)}</p>
                {purchaseId && (
                  <p className="text-sm mt-2 font-mono bg-muted p-2 rounded-sm text-foreground">
                    {t(currentLanguage, `${translationBaseKey}.orderId`, {
                      orderId: purchaseId,
                    })}
                  </p>
                )}
              </div>

              <div className="rounded-sm border border-amber-500/25 bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeft className="w-5 h-5 text-amber-700 dark:text-amber-500 shrink-0" />
                  <h3 className="font-semibold text-foreground">
                    {t(
                      currentLanguage,
                      `${translationBaseKey}.whatsNext.title`,
                    )}
                  </h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    •{" "}
                    {t(
                      currentLanguage,
                      `${translationBaseKey}.whatsNext.tryAgain`,
                    )}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      currentLanguage,
                      `${translationBaseKey}.whatsNext.differentMethod`,
                    )}
                  </li>
                  <li>
                    •{" "}
                    {t(
                      currentLanguage,
                      `${translationBaseKey}.whatsNext.contactSupport`,
                    )}
                  </li>
                </ul>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                {t(currentLanguage, `${translationBaseKey}.support`)}
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
