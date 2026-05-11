// Removed "use client"

// Keep only necessary imports for the page structure and metadata
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { Metadata } from "next";
import GalleryClientComponent from "./gallery-client";
import { SectionHeaderI18n } from "@/components/landing/section-header-i18n";
import { AppPageShell } from "@/components/layout/app-page-shell";

// Metadata export remains here (this is now a Server Component)
export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore our gallery of events, performances, and behind-the-scenes moments.",
};

// This is now a simple Server Component
export default function GalleryPage() {
  // Removed state, effects, handlers, and complex rendering logic

  // Render the page structure with the client component inside
  return (
    <AppPageShell>
      <Header />
      <SectionHeaderI18n translationKey="galleryPage.sectionBanner" />
      <GalleryClientComponent />
      <Footer />
    </AppPageShell>
  );
}

// Removed original async function Gallery and export default Gallery
