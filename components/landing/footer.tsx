"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { IG } from "@/components/icons/IG";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { Soundcloud } from "@/components/icons/Soundcloud";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { useFooterStripUrls } from "@/lib/contexts/FooterStripContext";

export default function Footer() {
  const { currentLanguage } = useTranslation();
  const stripUrls = useFooterStripUrls();

  const footerNav = [
    { href: "/events", labelKey: "header.nav.events" as const },
    { href: "/merch", labelKey: "header.nav.shop" as const },
    { href: "/gallery", labelKey: "header.nav.gallery" as const },
    { href: "/blog", labelKey: "header.nav.blog" as const },
    { href: "/a-propos", labelKey: "header.nav.about" as const },
    { href: "/agence", labelKey: "header.nav.agency" as const },
    { href: "/", labelKey: "header.nav.home" as const },
  ];

  const legal = [{ href: "/terms", labelKey: "footer.links.terms" as const }];

  const displayStrip =
    stripUrls.length >= 4
      ? stripUrls
      : stripUrls.length > 0
        ? [...stripUrls, ...stripUrls].slice(0, 6)
        : [];

  return (
    <footer className="bg-[#1a1a1a] text-white">
      {displayStrip.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
          {displayStrip.slice(0, 6).map((src, i) => (
            <div key={`${src}-${i}`} className="relative aspect-square">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="px-6 py-16 md:px-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="space-y-6">
              <Link
                href="/"
                className="relative block h-10 w-[140px] md:h-12 md:w-[168px]"
              >
                <Image
                  src="/white.png"
                  alt="Wêrê Klub"
                  fill
                  className="object-contain object-left"
                  sizes="168px"
                />
              </Link>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs tracking-widest uppercase text-white/50">
                Navigation
              </h3>
              <nav className="flex flex-col gap-3">
                {footerNav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm hover:text-white/70 transition-colors uppercase tracking-wide"
                  >
                    {t(currentLanguage, link.labelKey)}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-xs tracking-widest uppercase text-white/50">
                <Heart
                  className="h-4 w-4 shrink-0 text-white/55"
                  strokeWidth={1.5}
                  aria-hidden
                />
                {t(currentLanguage, "footer.socialHeading")}
              </h3>
              <ul className="flex items-center flex-wrap gap-3 list-none p-0 m-0">
                <li>
                  <Link
                    href="https://chat.whatsapp.com/BxTiBjirPMzFbCTAZ4eJqC?fbclid=PAZXh0bgNhZW0CMTEAAadv_FFXVz71jmu9zE5cSsaFB9b5cvqGivmL3cFD8hKPD_OtuwKXffahUqI3sw_aem_KaHbiZrZBfI2Yzzn-ozjKw"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="inline-flex items-center justify-center h-9 w-9 text-white transition-colors hover:text-[#25D366]"
                  >
                    <WhatsappIcon className="h-[22px] w-[22px]" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://soundcloud.com/wereklub"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Soundcloud"
                    className="inline-flex items-center justify-center h-9 w-9 text-white transition-colors hover:text-[#ff5500]"
                  >
                    <Soundcloud className="h-[20px] w-[20px]" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.facebook.com/wereklub"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="inline-flex items-center justify-center h-9 w-9 text-white transition-colors hover:text-[#1877F2]"
                  >
                    <FacebookIcon className="h-[19.5px] w-[19.5px]" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.instagram.com/wereklub/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex items-center justify-center h-9 w-9 text-white transition-colors hover:text-[#E4405F]"
                  >
                    <IG className="h-[23px] w-[23px]" />
                  </Link>
                </li>
              </ul>

              <div className="pt-4 space-y-3">
                {legal.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-white/70 hover:text-white/90 uppercase tracking-wide"
                  >
                    {t(currentLanguage, link.labelKey)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-xs text-white/50">
              {t(currentLanguage, "footer.copyright", {
                year: new Date().getFullYear(),
              })}
            </p>
            <LanguageSwitcher className="!text-white/50 hover:!text-white/90" />
          </div>
        </div>
      </div>
    </footer>
  );
}
