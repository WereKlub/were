import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart/cart-context";
import { SanityProduct } from "./types";
import { useTheme } from "@/lib/contexts/ThemeContext";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

function ProductCardContent({ product }: { product: SanityProduct }) {
  const { addItem } = useCart();
  const { button } = useTheme();
  const { currentLanguage } = useTranslation();
  const slug =
    typeof product.slug === "string"
      ? product.slug
      : product.slug?.current || "";
  const mainImage =
    product.mainImage ||
    product.images?.[0]?.asset?.url ||
    product.images?.[0]?.url;
  const hasValidImage = mainImage && mainImage.trim() !== "";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-border/40 bg-background">
      <Link
        href={`/boutique/${slug}`}
        className="relative block aspect-square overflow-hidden bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-label={`View details for ${product.name}, price ${product.price} F CFA`}
        prefetch
      >
        {hasValidImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            quality={100}
            placeholder={
              product.images?.[0]?.metadata?.lqip ? "blur" : undefined
            }
            blurDataURL={product.images?.[0]?.metadata?.lqip}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              No image
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 border-t border-border/40 p-4 md:p-4">
        <div className="space-y-1">
          <Link
            href={`/boutique/${slug}`}
            className="block outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h3 className="font-display text-base font-black uppercase leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary md:text-base line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground md:text-xs">
            {formatPrice(product.price)} F CFA
          </p>
        </div>

        <Suspense
          fallback={
            <Button
              disabled
              className={`min-h-9 w-full rounded-md text-[10px] font-medium tracking-[0.14em] uppercase md:text-xs ${button.primary}`}
            >
              ...
            </Button>
          }
        >
          <Button
            className={`min-h-9 w-full rounded-md text-[10px] font-medium tracking-[0.14em] uppercase transition-colors md:text-xs ${button.primary}`}
            onClick={handleAddToCart}
          >
            {t(currentLanguage, "merchPage.productDetail.addToCart")}
          </Button>
        </Suspense>
      </div>
    </article>
  );
}

export const ProductCard = ({ product }: { product: SanityProduct }) => {
  return <ProductCardContent product={product} />;
};
