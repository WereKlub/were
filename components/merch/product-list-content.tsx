"use client";

import { ProductCard } from "@/components/merch/product-card";
import { ProductGrid } from "@/components/merch/product-grid";
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
    <ProductGrid>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </ProductGrid>
  ) : (
    <PageEmptyState>
      {t(currentLanguage, "merchPage.noProductsFound")}
    </PageEmptyState>
  );
}
