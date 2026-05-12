import type { Metadata } from "next";
import { getAllNewsPosts } from "@/lib/queries/news";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import NewsContent from "./news-client";
import { AppPageShell } from "@/components/layout/app-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  // For now, return static metadata - in a real app you'd get the current language
  // and return the appropriate translated metadata
  return {
    title: "Blog | Wêrê Klub",
    description:
      "Latest news, event recaps, and entertainment insights from Wêrê Klub",
  };
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
