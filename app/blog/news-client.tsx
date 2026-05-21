"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

import type { NewsPost } from "@/lib/types/news";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { PageIntro } from "@/components/layout/page-intro";
import { PageContentBelowIntro } from "@/components/layout/page-content-below-intro";
import { PageEmptyState } from "@/components/layout/page-empty-state";

interface NewsContentProps {
  posts: NewsPost[];
}

export default function NewsContent({ posts }: NewsContentProps) {
  const { currentLanguage } = useTranslation();

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
          <div className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto pb-16 md:pb-20 pt-10 md:pt-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug.current}`}
                  className="group flex flex-col border border-border bg-card text-card-foreground hover:border-foreground/25 transition-colors rounded-md overflow-hidden shadow-sm h-full"
                >
                  <div className="relative aspect-4/5 w-full overflow-hidden bg-muted shrink-0">
                    <Image
                      src={post.mainImage?.asset?.url || "/placeholder.webp"}
                      alt={post.mainImage?.alt || post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      quality={90}
                    />
                  </div>
                  <div className="p-3 md:p-4 border-t border-border flex flex-col gap-2 grow min-h-0">
                    <p className="text-[10px] md:text-xs tracking-[0.22em] uppercase text-muted-foreground">
                      {format(new Date(post.publishedAt), "MMM d, yyyy")}
                    </p>
                    <h3 className="font-display text-base md:text-lg font-bold uppercase tracking-tight text-balance leading-snug group-hover:text-foreground/90 line-clamp-3">
                      {post.title}
                    </h3>
                    {post.excerpt ? (
                      <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-3 mt-auto">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </PageContentBelowIntro>
    </>
  );
}
