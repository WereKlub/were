"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

import type { NewsPost } from "@/lib/types/news";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { SectionHeader } from "@/components/landing/section-header";
import { PageIntro } from "@/components/layout/page-intro";
import { PageContentBelowIntro } from "@/components/layout/page-content-below-intro";
import { PageEmptyState } from "@/components/layout/page-empty-state";
import { AppPageContainer } from "@/components/layout/app-page-shell";
import { ProductGrid } from "@/components/merch/product-grid";

interface NewsContentProps {
  posts: NewsPost[];
}

export default function NewsContent({ posts }: NewsContentProps) {
  const { currentLanguage } = useTranslation();
  const dateLocale = currentLanguage === "fr" ? fr : enUS;

  return (
    <>
      <PageIntro
        title={t(currentLanguage, "newsPage.title")}
        subtitle={
          posts.length === 0
            ? undefined
            : t(currentLanguage, "newsPage.description")
        }
      />

      <PageContentBelowIntro>
        {posts.length === 0 ? (
          <PageEmptyState>
            {t(currentLanguage, "newsPage.noPosts")}
          </PageEmptyState>
        ) : (
          <>
            <SectionHeader
              title={t(currentLanguage, "newsPage.articlesSection")}
            />
            <AppPageContainer className="pb-16 pt-10 md:pb-20 md:pt-12">
              <ProductGrid>
                {posts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug.current}`}
                    className="group flex h-full flex-col overflow-hidden border border-border/40 bg-background transition-colors hover:border-foreground/25"
                  >
                    <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={post.mainImage?.asset?.url || "/placeholder.webp"}
                        alt={post.mainImage?.alt || post.title}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        quality={90}
                      />
                    </div>
                    <div className="flex min-h-0 grow flex-col gap-2.5 border-t border-border/40 p-3 md:p-4">
                      <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground">
                        {format(new Date(post.publishedAt), "MMM d, yyyy", {
                          locale: dateLocale,
                        })}
                      </p>
                      <h3 className="line-clamp-2 font-display text-sm font-black uppercase leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary md:text-base">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-auto line-clamp-3 text-xs text-muted-foreground">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </ProductGrid>
            </AppPageContainer>
          </>
        )}
      </PageContentBelowIntro>
    </>
  );
}
