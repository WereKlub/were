"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { openCartExternally } from "@/components/merch/cart/cart-modal";
import {
  AppPageContainer,
  AppPageShell,
} from "@/components/layout/app-page-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { PageContentBelowIntro } from "@/components/layout/page-content-below-intro";
import { DetailSectionHeader } from "@/components/layout/detail-section-header";

interface PaymentCancelClientProps {
  purchaseId?: string;
  flow?: string;
  returnTo?: string;
}

function isSafeReturnPath(path: string | undefined): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

export function PaymentCancelClient({
  purchaseId,
  flow,
  returnTo,
}: PaymentCancelClientProps) {
  const { currentLanguage } = useTranslation();
  const isMerch = flow === "merch";
  const translationBaseKey = isMerch ? "paymentCancelMerch" : "paymentCancel";
  const safeReturnTo = isSafeReturnPath(returnTo) ? returnTo : null;

  return (
    <AppPageShell>
      <Header />

      <PageIntro
        title={t(currentLanguage, `${translationBaseKey}.title`)}
        subtitle={t(currentLanguage, `${translationBaseKey}.description`)}
        bodyClassName="max-w-2xl md:max-w-3xl"
      />

      <PageContentBelowIntro>
        <AppPageContainer className="flex justify-center pb-16 pt-10 md:pb-20 md:pt-12">
          <div className="w-full max-w-lg">
            <div className="rounded-md border border-border/50 bg-card/50 p-8 shadow-lg backdrop-blur-sm md:p-10">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md border border-border bg-muted">
                  <XCircle className="h-8 w-8 text-amber-700 dark:text-amber-500" />
                </div>
                {purchaseId ? (
                  <p className="rounded-md bg-muted p-3 font-mono text-sm text-foreground">
                    {t(currentLanguage, `${translationBaseKey}.orderId`, {
                      orderId: purchaseId,
                    })}
                  </p>
                ) : null}
              </div>

              <DetailSectionHeader
                title={t(
                  currentLanguage,
                  `${translationBaseKey}.whatsNext.title`,
                )}
                className="mb-4"
              />
              <ul className="mb-8 space-y-2 text-sm text-muted-foreground">
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

              <div className="mb-6 flex flex-col gap-3">
                {safeReturnTo ? (
                  <Button
                    variant="default"
                    asChild
                    className="w-full rounded-md"
                  >
                    <Link href={safeReturnTo}>
                      {t(
                        currentLanguage,
                        `${translationBaseKey}.buttons.tryAgain`,
                      )}
                    </Link>
                  </Button>
                ) : null}
                {isMerch ? (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full rounded-md"
                    >
                      <Link href="/boutique">
                        {t(
                          currentLanguage,
                          `${translationBaseKey}.buttons.backToEvents`,
                        )}
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-md"
                      onClick={() => openCartExternally()}
                    >
                      {t(
                        currentLanguage,
                        `${translationBaseKey}.buttons.viewCart`,
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    asChild
                    className="w-full rounded-md"
                  >
                    <Link href="/events">
                      {t(
                        currentLanguage,
                        `${translationBaseKey}.buttons.backToEvents`,
                      )}
                    </Link>
                  </Button>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                {t(currentLanguage, `${translationBaseKey}.support`)}
              </p>
            </div>
          </div>
        </AppPageContainer>
      </PageContentBelowIntro>

      <Footer />
    </AppPageShell>
  );
}
