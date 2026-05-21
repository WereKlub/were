import { getAllNewsPosts } from "@/lib/queries/news";
import { buildPageMetadata } from "@/lib/site-metadata";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import NewsContent from "./news-client";
import { AppPageShell } from "@/components/layout/app-page-shell";

export async function generateMetadata() {
  return buildPageMetadata({
    title: "Blog | Wêrê Klub",
    description:
      "Latest news, event recaps, and entertainment insights from Wêrê Klub",
    path: "/blog",
  });
}

export default async function NewsPage() {
  const posts = await getAllNewsPosts();

  return (
    <AppPageShell>
      <Header />
      <div className="flex flex-col grow min-w-0">
        <NewsContent posts={posts} />
      </div>
      <Footer />
    </AppPageShell>
  );
}
