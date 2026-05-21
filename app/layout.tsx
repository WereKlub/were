import type React from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { rootMetadata } from "@/lib/site-metadata";
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

export const metadata = rootMetadata;

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
        <ThemeProvider>
          <ButtonThemeProvider
            primaryButtonColor={themeSettings.primaryButtonColor}
          >
            <NavigationSettingsProvider
              showBlogInNavigation={navSettings.showBlogInNavigation}
              showAboutInNavigation={navSettings.showAboutInNavigation ?? false}
              showAgencyInNavigation={
                navSettings.showAgencyInNavigation ?? false
              }
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
