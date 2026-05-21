"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { PortableText } from "@portabletext/react";
import { ArrowLeft, Tag, User } from "lucide-react";

import type { NewsPost } from "@/lib/types/news";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { PageIntro } from "@/components/layout/page-intro";
import { PageContentBelowIntro } from "@/components/layout/page-content-below-intro";
import { AppPageContainer } from "@/components/layout/app-page-shell";

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
        <AppPageContainer className="pb-16 pt-10 md:pb-20 md:pt-12">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t(currentLanguage, "newsPage.backToBlog")}
          </Link>

          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground md:text-xs">
              {formattedDate}
            </p>

            {post.author ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span>{post.author.name}</span>
              </div>
            ) : null}

            {post.categories && post.categories.length > 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4 shrink-0" />
                <span>{post.categories.map((cat) => cat.title).join(", ")}</span>
              </div>
            ) : null}
          </div>

          {post.mainImage ? (
            <div className="relative mb-10 aspect-video overflow-hidden rounded-md border border-border/50 bg-muted shadow-lg md:mb-12">
              <Image
                src={post.mainImage.asset?.url || "/placeholder.webp"}
                alt={post.mainImage.alt || post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
            </div>
          ) : null}

          <div className="rounded-md border border-border/50 bg-card/50 p-8 shadow-lg backdrop-blur-sm md:p-12">
            <div className="prose prose-lg md:prose-xl max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-primary prose-code:text-primary">
              <PortableText value={post.body} />
            </div>
          </div>

          <footer className="mt-12 border-t border-border/50 pt-8 md:mt-16">
            <p className="text-center text-sm text-muted-foreground">
              {t(currentLanguage, "newsPage.publishedOn", { date: formattedDate })}
            </p>
          </footer>
        </AppPageContainer>
      </PageContentBelowIntro>
    </article>
  );
}
