"use client";

import Link from "next/link";
import Image from "next/image";
import { IG } from "@/components/icons/IG";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { Soundcloud } from "@/components/icons/Soundcloud";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { ThemeModeSwitch } from "@/components/landing/theme-mode-switch";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import { useFooterStripUrls } from "@/lib/contexts/FooterStripContext";

const SOCIAL_LINKS = [
  {
    href: "https://chat.whatsapp.com/BxTiBjirPMzFbCTAZ4eJqC?fbclid=PAZXh0bgNhZW0CMTEAAadv_FFXVz71jmu9zE5cSsaFB9b5cvqGivmL3cFD8hKPD_OtuwKXffahUqI3sw_aem_KaHbiZrZBfI2Yzzn-ozjKw",
    labelKey: "footer.social.whatsapp" as const,
    Icon: WhatsappIcon,
    hoverClass: "hover:text-[#25D366] dark:hover:text-[#25D366]",
  },
  {
    href: "https://soundcloud.com/wereklub",
    labelKey: "footer.social.soundcloud" as const,
    Icon: Soundcloud,
    hoverClass: "hover:text-[#ff5500] dark:hover:text-[#ff5500]",
  },
  {
    href: "https://www.facebook.com/wereklub",
    labelKey: "footer.social.facebook" as const,
    Icon: FacebookIcon,
    hoverClass: "hover:text-[#1877F2] dark:hover:text-[#1877F2]",
  },
  {
    href: "https://www.instagram.com/wereklub/",
    labelKey: "footer.social.instagram" as const,
    Icon: IG,
    hoverClass: "hover:text-[#E4405F] dark:hover:text-[#E4405F]",
  },
] as const;

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
    { href: "/terms", labelKey: "footer.links.terms" as const },
  ];

  const footerNavCol1 = footerNav.slice(0, 4);
  const footerNavCol2 = footerNav.slice(4);

  const displayStrip =
    stripUrls.length >= 4
      ? stripUrls
      : stripUrls.length > 0
        ? [...stripUrls, ...stripUrls].slice(0, 6)
        : [];

  return (
    <footer className="bg-muted/80 text-foreground border-t border-border dark:bg-[#1a1a1a] dark:text-white">
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
                className="relative block h-36 w-full max-w-[340px] sm:h-44 sm:max-w-[440px] md:h-52 md:max-w-[560px]"
              >
                <Image
                  src="/dark.png"
                  alt="Wêrê Klub"
                  fill
                  className="object-contain object-left dark:hidden"
                  sizes="(max-width: 640px) 340px, (max-width: 768px) 440px, 560px"
                />
                <Image
                  src="/white.png"
                  alt=""
                  aria-hidden
                  fill
                  className="hidden object-contain object-left dark:block"
                  sizes="(max-width: 640px) 340px, (max-width: 768px) 440px, 560px"
                />
              </Link>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs tracking-widest uppercase text-muted-foreground dark:text-white/50">
                Navigation
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <nav className="flex flex-col gap-3">
                  {footerNavCol1.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-foreground hover:text-muted-foreground transition-colors uppercase tracking-wide dark:text-white dark:hover:text-white/70"
                    >
                      {t(currentLanguage, link.labelKey)}
                    </Link>
                  ))}
                </nav>
                <nav className="flex flex-col gap-3">
                  {footerNavCol2.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-foreground hover:text-muted-foreground transition-colors uppercase tracking-wide dark:text-white dark:hover:text-white/70"
                    >
                      {t(currentLanguage, link.labelKey)}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs tracking-widest uppercase text-muted-foreground dark:text-white/50">
                {t(currentLanguage, "footer.socialHeading")}
              </h3>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {SOCIAL_LINKS.map(({ href, labelKey, Icon, hoverClass }) => {
                  const label = t(currentLanguage, labelKey);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={`inline-flex w-fit max-w-full items-center gap-2.5 text-sm uppercase tracking-wide text-foreground transition-colors dark:text-white/90 ${hoverClass}`}
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center"
                          aria-hidden
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border dark:border-white/10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <p className="text-xs text-muted-foreground dark:text-white/50 leading-normal">
              {t(currentLanguage, "footer.copyright", {
                year: new Date().getFullYear(),
              })}
            </p>
            <div className="flex flex-row items-center gap-3 shrink-0 *:leading-none">
              <LanguageSwitcher className="text-muted-foreground! hover:text-foreground! dark:text-white/50! dark:hover:text-white/90!" />
              <ThemeModeSwitch className="dark:border-white/15" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
