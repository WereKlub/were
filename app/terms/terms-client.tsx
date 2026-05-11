"use client";

import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { SectionHeaderI18n } from "@/components/landing/section-header-i18n";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import {
  AppPageContainer,
  AppPageShell,
} from "@/components/layout/app-page-shell";

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function TermsClientPage() {
  const { currentLanguage } = useTranslation();

  return (
    <AppPageShell>
      <Header />
      <SectionHeaderI18n translationKey="termsPage.sectionBanner" />
      <div className="flex flex-col grow min-w-0">
        <AppPageContainer className="max-w-4xl pb-16 -mt-2">
          <div className="text-center pb-10">
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-foreground mb-4">
              {t(currentLanguage, "termsPage.title")}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {t(currentLanguage, "termsPage.subtitle")}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-[0.2em] mt-4">
              {t(currentLanguage, "termsPage.lastUpdated", {
                date: formattedDate,
              })}
            </p>
          </div>

          {/* Terms content card */}
          <article className="mb-16 border border-border bg-card px-6 py-8 md:px-8 md:py-10">
            <div
              className="prose prose-neutral max-w-none lg:prose-lg dark:prose-invert
                        prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wide
                        prose-p:leading-relaxed
                        prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
            >
              {/* 01 – Introduction */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  01 — {t(currentLanguage, "termsPage.introduction.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.introduction.p1")}</p>
                <p>{t(currentLanguage, "termsPage.introduction.p2")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 02 – Mission */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  02 — {t(currentLanguage, "termsPage.mission.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.mission.p1")}</p>
                <p>{t(currentLanguage, "termsPage.mission.p2")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 03 – Code of Conduct */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  03 — {t(currentLanguage, "termsPage.conduct.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.conduct.p1")}</p>
                <ul>
                  <li>{t(currentLanguage, "termsPage.conduct.listItem1")}</li>
                  <li>{t(currentLanguage, "termsPage.conduct.listItem2")}</li>
                  <li>{t(currentLanguage, "termsPage.conduct.listItem3")}</li>
                </ul>
                <p>{t(currentLanguage, "termsPage.conduct.p2")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 04 – Tickets & Events */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  04 — {t(currentLanguage, "termsPage.tickets.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.tickets.p1")}</p>
                <p>{t(currentLanguage, "termsPage.tickets.p2")}</p>
                <p>{t(currentLanguage, "termsPage.tickets.p3")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 05 – Intellectual Property */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  05 — {t(currentLanguage, "termsPage.ip.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.ip.p1")}</p>
                <p>{t(currentLanguage, "termsPage.ip.p2")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 06 – User Content */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  06 — {t(currentLanguage, "termsPage.userContent.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.userContent.p1")}</p>
                <p>{t(currentLanguage, "termsPage.userContent.p2")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 07 – Liability */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  07 — {t(currentLanguage, "termsPage.liability.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.liability.p1")}</p>
                <p>{t(currentLanguage, "termsPage.liability.p2")}</p>
                <p>{t(currentLanguage, "termsPage.liability.p3")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 08 – Indemnification */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  08 — {t(currentLanguage, "termsPage.indemnification.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.indemnification.p1")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 09 – Governing Law */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  09 — {t(currentLanguage, "termsPage.governingLaw.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.governingLaw.p1")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 10 – Changes */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  10 — {t(currentLanguage, "termsPage.changes.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.changes.p1")}</p>
                <p>{t(currentLanguage, "termsPage.changes.p2")}</p>
              </section>

              <div className="h-px w-full bg-border/60 my-6 md:my-8" />

              {/* 11 – Contact */}
              <section className="space-y-3 md:space-y-4">
                <p className="text-[11px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  11 — {t(currentLanguage, "termsPage.contact.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.contact.p1")}</p>
                <p>{t(currentLanguage, "termsPage.contact.p2")}</p>
              </section>
            </div>
          </article>
        </AppPageContainer>
      </div>
      <Footer />
    </AppPageShell>
  );
}
