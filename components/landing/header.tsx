"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import CartModal from "@/components/merch/cart/cart-modal";
import { useNavigationSettings } from "@/lib/contexts/NavigationSettingsContext";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";

interface NavItem {
  nameKey: string;
  path: string;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { currentLanguage } = useTranslation();
  const { showBlogInNavigation, showGalleryInNavigation } =
    useNavigationSettings();

  const navItems: NavItem[] = [
    { nameKey: "header.nav.home", path: "/" },
    { nameKey: "header.nav.events", path: "/events" },
    ...(showGalleryInNavigation
      ? [{ nameKey: "header.nav.gallery" as const, path: "/gallery" }]
      : []),
    ...(showBlogInNavigation
      ? [{ nameKey: "header.nav.blog" as const, path: "/blog" }]
      : []),
    { nameKey: "header.nav.shop", path: "/merch" },
    { nameKey: "header.nav.about", path: "/a-propos" },
    { nameKey: "header.nav.agency", path: "/agence" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between px-6 py-4 md:px-12">
        <Link
          href="/"
          className="relative block h-8 w-[120px] md:h-9 md:w-[140px] shrink-0"
        >
          <Image
            src="/dark.png"
            alt="Wêrê Klub"
            fill
            className="object-contain object-left"
            sizes="140px"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-xs tracking-[0.2em] transition-colors hover:text-foreground/70 uppercase ${
                pathname === item.path
                  ? "border border-foreground px-3 py-1.5 text-foreground"
                  : "text-foreground"
              }`}
            >
              {t(currentLanguage, item.nameKey)}
            </Link>
          ))}
          <div className="pl-2 border-l border-border">
            <CartModal />
          </div>
        </nav>

        <div className="lg:hidden flex items-center gap-4">
          <CartModal />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="text-foreground p-1"
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen
                ? t(currentLanguage, "header.mobileMenu.close")
                : t(currentLanguage, "header.mobileMenu.toggle")
            }
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="lg:hidden bg-background border-t border-border">
          <nav className="flex flex-col p-6 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm tracking-widest py-3 uppercase border-b border-border/50 ${
                  pathname === item.path ? "font-bold" : ""
                }`}
              >
                {t(currentLanguage, item.nameKey)}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
