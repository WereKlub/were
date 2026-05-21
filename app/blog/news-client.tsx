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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5">
                {posts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug.current}`}
                    className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-sm transition-colors hover:border-foreground/25"
                  >
                    <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={post.mainImage?.asset?.url || "/placeholder.webp"}
                        alt={post.mainImage?.alt || post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw"
                        quality={90}
                      />
                    </div>
                    <div className="flex min-h-0 grow flex-col gap-2 border-t border-border p-3 md:p-4">
                      <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground md:text-xs">
                        {format(new Date(post.publishedAt), "MMM d, yyyy", {
                          locale: dateLocale,
                        })}
                      </p>
                      <h3 className="line-clamp-3 font-display text-base font-bold uppercase leading-snug tracking-tight text-balance group-hover:text-foreground/90 md:text-lg">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-auto line-clamp-3 text-[11px] text-muted-foreground md:text-xs">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </AppPageContainer>
          </>
        )}
      </PageContentBelowIntro>
    </>
  );
}
