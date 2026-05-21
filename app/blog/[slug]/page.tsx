import { notFound } from "next/navigation";
import { getNewsPostBySlug } from "@/lib/queries/news";
import type { NewsPost } from "@/lib/types/news";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { AppPageShell } from "@/components/layout/app-page-shell";
import { buildPageMetadata } from "@/lib/site-metadata";
import { BlogArticleContent } from "./blog-article-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: NewsPost | null = await getNewsPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const imageUrl =
    post.mainImage?.asset?.url ?? post.image?.asset?.url ?? undefined;

  return buildPageMetadata({
    title: `${post.title} | Wêrê Klub Blog`,
    description: post.excerpt,
    path: `/blog/${slug}`,
    imageUrl,
    imageAlt: post.mainImage?.alt ?? post.title,
    type: "article",
  });
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: NewsPost | null = await getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <AppPageShell>
      <Header />
      <BlogArticleContent post={post} />
      <Footer />
    </AppPageShell>
  );
}
