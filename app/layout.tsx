import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { TranslationProvider } from "@/lib/contexts/TranslationContext";
import { NavigationSettingsProvider } from "@/lib/contexts/NavigationSettingsContext";
import { CartProvider } from "@/components/merch/cart/cart-context";
import { FacebookPixel } from "@/components/ui/FacebookPixel";
import {
  getNavigationSettings,
  getHomepageThemeSettings,
  getFooterStripImageUrls,
} from "@/lib/sanity/queries";
import { ButtonThemeProvider } from "@/lib/contexts/ThemeContext";
import { FooterStripProvider } from "@/lib/contexts/FooterStripContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Ensure root layout always fetches fresh nav settings (no static cache)
export const dynamic = "force-dynamic";

const siteConfig = {
  name: "Wêrê Klub",
  description: "Music events out of Abidjan.",
  url: "https://wereklub.com",
  ogImage: "/banner.webp",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@lomiafrica",
    site: "https://lomi.africa",
  },
  // Optional: Add robots and manifest info if needed
  // robots: { index: true, follow: true },
  // manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navSettings, themeSettings, footerStripUrls] = await Promise.all([
    getNavigationSettings(),
    getHomepageThemeSettings(),
    getFooterStripImageUrls(),
  ]);
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} bg-background`}
    >
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <FacebookPixel />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ButtonThemeProvider
            primaryButtonColor={themeSettings.primaryButtonColor}
          >
            <NavigationSettingsProvider
              showBlogInNavigation={navSettings.showBlogInNavigation}
              showGalleryInNavigation={navSettings.showGalleryInNavigation}
            >
              <TranslationProvider>
                <CartProvider>
                  <FooterStripProvider urls={footerStripUrls}>
                    <main className="grow">{children}</main>
                  </FooterStripProvider>
                </CartProvider>
              </TranslationProvider>
            </NavigationSettingsProvider>
          </ButtonThemeProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
