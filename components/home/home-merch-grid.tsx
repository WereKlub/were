"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { MerchCarouselCard } from "@/components/home/merch-carousel-card";

type MerchHomeProduct = {
  _id: string;
  name: string;
  slug: string;
  mainImage?: string;
  price?: number;
  tags?: string[];
  stock?: number;
  images?: Array<{
    asset?: {
      url?: string;
    };
  }>;
};

export function HomeMerchGrid({ products }: { products: MerchHomeProduct[] }) {
  const { currentLanguage } = useTranslation();

  if (!products.length) return null;

  return (
    <section className="bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-4 md:px-8 lg:px-12 py-8 md:py-12 border-b border-border">
          <h2 className="text-sm md:text-base tracking-[0.3em] uppercase text-foreground">
            {t(currentLanguage, "homePage.shopMerch")}
          </h2>
          <Link
            href="/merch"
            className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {t(currentLanguage, "homePage.viewAll")} →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-8 lg:px-12 pb-16 md:pb-20 pt-8">
          {products.map((product) => (
            <MerchCarouselCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
