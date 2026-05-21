"use client";

import { ProductCard } from "@/components/merch/product-card";
import { SanityProduct } from "./types";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { PageEmptyState } from "@/components/layout/page-empty-state";

interface ProductListContentProps {
  products: SanityProduct[];
}

export function ProductListContent({ products }: ProductListContentProps) {
  const { currentLanguage } = useTranslation();

  return products.length > 0 ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  ) : (
    <PageEmptyState>
      {t(currentLanguage, "merchPage.noProductsFound")}
    </PageEmptyState>
  );
}
