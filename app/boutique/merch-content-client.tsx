"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { ProductListContent } from "@/components/merch/product-list-content";
import { ProductGrid } from "@/components/merch/product-grid";
import { ProductCardSkeleton } from "@/components/merch/product-card-skeleton";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { SanityProduct } from "@/components/merch/types";
import {
  AppPageContainer,
  AppPageShell,
} from "@/components/layout/app-page-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { PageContentBelowIntro } from "@/components/layout/page-content-below-intro";
import { PageEmptyState } from "@/components/layout/page-empty-state";

interface MerchContentClientProps {
  products: SanityProduct[];
}

export default function MerchContentClient({
  products,
}: MerchContentClientProps) {
  const { currentLanguage } = useTranslation();

  return (
    <AppPageShell>
      <Header />

      <PageIntro
        title={t(currentLanguage, "merchPage.title")}
        subtitle={
          products.length === 0
            ? undefined
            : t(currentLanguage, "merchPage.subtitle")
        }
      />

      <PageContentBelowIntro>
        <div className="flex flex-col grow min-w-0">
          <AppPageContainer className="pt-10 md:pt-12 pb-16 md:pb-20">
            {/* Products Section */}
            {products.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Suspense
                  fallback={
                    <ProductGrid>
                      {Array.from({ length: 12 }).map((_, index) => (
                        <ProductCardSkeleton key={index} />
                      ))}
                    </ProductGrid>
                  }
                >
                  <ProductListContent products={products} />
                </Suspense>
              </motion.div>
            ) : (
              <PageEmptyState>
                {t(currentLanguage, "merchPage.comingSoon.description")}
              </PageEmptyState>
            )}
          </AppPageContainer>
        </div>
      </PageContentBelowIntro>

      <Footer />
    </AppPageShell>
  );
}
