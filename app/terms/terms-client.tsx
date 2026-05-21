"use client";

import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { t } from "@/lib/i18n/translations";
import {
  AppPageContainer,
  AppPageShell,
} from "@/components/layout/app-page-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { PageContentBelowIntro } from "@/components/layout/page-content-below-intro";

const today = new Date();

export default function TermsClientPage() {
  const { currentLanguage } = useTranslation();
  const dateLocale = currentLanguage === "fr" ? "fr-FR" : "en-US";
  const formattedDate = today.toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppPageShell>
      <Header />

      <PageIntro
        title={t(currentLanguage, "termsPage.title")}
        subtitle={t(currentLanguage, "termsPage.subtitle")}
      />

      <PageContentBelowIntro>
        <AppPageContainer className="max-w-4xl pb-16 pt-10 md:pb-20 md:pt-12">
          <p className="mb-8 text-xs tracking-[0.22em] uppercase text-muted-foreground">
            {t(currentLanguage, "termsPage.lastUpdated", {
              date: formattedDate,
            })}
          </p>

          <article className="rounded-md border border-border/50 bg-card/50 px-6 py-8 shadow-lg backdrop-blur-sm md:px-8 md:py-10">
            <div
              className="prose prose-neutral max-w-none lg:prose-lg dark:prose-invert
                        prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight
                        prose-p:text-muted-foreground prose-p:leading-relaxed
                        prose-strong:text-foreground
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            >
              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  01. {t(currentLanguage, "termsPage.introduction.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.introduction.p1")}</p>
                <p>{t(currentLanguage, "termsPage.introduction.p2")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  02. {t(currentLanguage, "termsPage.mission.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.mission.p1")}</p>
                <p>{t(currentLanguage, "termsPage.mission.p2")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  03. {t(currentLanguage, "termsPage.conduct.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.conduct.p1")}</p>
                <ul>
                  <li>{t(currentLanguage, "termsPage.conduct.listItem1")}</li>
                  <li>{t(currentLanguage, "termsPage.conduct.listItem2")}</li>
                  <li>{t(currentLanguage, "termsPage.conduct.listItem3")}</li>
                </ul>
                <p>{t(currentLanguage, "termsPage.conduct.p2")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  04. {t(currentLanguage, "termsPage.tickets.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.tickets.p1")}</p>
                <p>{t(currentLanguage, "termsPage.tickets.p2")}</p>
                <p>{t(currentLanguage, "termsPage.tickets.p3")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  05. {t(currentLanguage, "termsPage.ip.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.ip.p1")}</p>
                <p>{t(currentLanguage, "termsPage.ip.p2")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  06. {t(currentLanguage, "termsPage.userContent.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.userContent.p1")}</p>
                <p>{t(currentLanguage, "termsPage.userContent.p2")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  07. {t(currentLanguage, "termsPage.liability.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.liability.p1")}</p>
                <p>{t(currentLanguage, "termsPage.liability.p2")}</p>
                <p>{t(currentLanguage, "termsPage.liability.p3")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  08. {t(currentLanguage, "termsPage.indemnification.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.indemnification.p1")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  09. {t(currentLanguage, "termsPage.governingLaw.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.governingLaw.p1")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  10. {t(currentLanguage, "termsPage.changes.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.changes.p1")}</p>
                <p>{t(currentLanguage, "termsPage.changes.p2")}</p>
              </section>

              <div className="my-6 h-px w-full bg-border/60 md:my-8" />

              <section className="space-y-3 md:space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  11. {t(currentLanguage, "termsPage.contact.title")}
                </p>
                <p>{t(currentLanguage, "termsPage.contact.p1")}</p>
                <p>{t(currentLanguage, "termsPage.contact.p2")}</p>
              </section>
            </div>
          </article>
        </AppPageContainer>
      </PageContentBelowIntro>

      <Footer />
    </AppPageShell>
  );
}
