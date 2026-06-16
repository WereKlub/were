"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { ArrowLeft, User } from "lucide-react";

import type { NewsPost } from "@/lib/types/news";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { PageIntro } from "@/components/layout/page-intro";
import { PageContentBelowIntro } from "@/components/layout/page-content-below-intro";
import { AppPageContainer } from "@/components/layout/app-page-shell";
import { BlogPortableText } from "@/components/blog/blog-portable-text";

interface BlogArticleContentProps {
  post: NewsPost;
}

export function BlogArticleContent({ post }: BlogArticleContentProps) {
  const { currentLanguage } = useTranslation();
  const dateLocale = currentLanguage === "fr" ? fr : enUS;
  const formattedDate = format(new Date(post.publishedAt), "MMMM d, yyyy", {
    locale: dateLocale,
  });

  return (
    <article className="flex min-w-0 grow flex-col">
      <PageIntro
        title={post.title}
        subtitle={post.excerpt || undefined}
        bodyClassName="max-w-2xl md:max-w-3xl"
      />

      <PageContentBelowIntro>
        <AppPageContainer className="min-w-0 pb-16 pt-10 md:pb-20 md:pt-12">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t(currentLanguage, "newsPage.backToBlog")}
          </Link>

          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground">
              {formattedDate}
            </p>

            {post.author ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span>{post.author.name}</span>
              </div>
            ) : null}
          </div>

          {post.mainImage ? (
            <div className="relative mb-8 aspect-square w-full overflow-hidden rounded-md border border-border/50 bg-muted shadow-lg sm:aspect-video md:mb-12">
              <Image
                src={post.mainImage.asset?.url || "/placeholder.webp"}
                alt={post.mainImage.alt || post.title}
                fill
                priority
                loading="eager"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
            </div>
          ) : null}

          <div className="min-w-0 w-full overflow-x-clip rounded-md border border-border/50 bg-card/50 p-8 shadow-lg backdrop-blur-sm md:p-12">
            <BlogPortableText value={post.body} />
          </div>

          <footer className="mt-12 border-t border-border/50 pt-8 md:mt-16">
            <p className="text-center text-sm text-muted-foreground">
              {t(currentLanguage, "newsPage.publishedOn", {
                date: formattedDate,
              })}
            </p>
          </footer>
        </AppPageContainer>
      </PageContentBelowIntro>
    </article>
  );
}
