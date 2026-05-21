import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";

export type AgencyPartnerLogo = {
  name: string;
  logoUrl: string;
  logoAlt: string;
  url?: string | null;
};

interface AgencyShowcasePanelProps {
  introLabel?: string;
  heading: string;
  body?: unknown;
  missionHeading?: string;
  missionBody?: string;
  logosIntro?: string;
  logoBoxLabel?: string;
  partnerLogos: AgencyPartnerLogo[];
  contactEmail?: string;
  bookingEmail?: string;
}

const panelProseClass =
  "prose prose-sm md:prose-base max-w-none prose-p:leading-relaxed prose-p:mb-4 prose-headings:font-display prose-headings:uppercase prose-strong:font-bold text-foreground/90 [&_p:last-child]:mb-0";

export function AgencyShowcasePanel({
  introLabel,
  heading,
  body,
  missionHeading,
  missionBody,
  logosIntro,
  logoBoxLabel,
  partnerLogos,
  contactEmail,
  bookingEmail,
}: AgencyShowcasePanelProps) {
  return (
    <div className="flex min-h-full flex-col gap-10 md:gap-12">
      <div className="space-y-6 md:space-y-8">
        {introLabel ? (
          <p className="text-sm leading-relaxed text-foreground/75 md:text-base">
            {introLabel}
          </p>
        ) : null}

        <h1 className="font-display text-3xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-4xl lg:text-[2.75rem]">
          {heading}
        </h1>

        {body ? (
          <div className={panelProseClass}>
            <PortableText value={body as never} />
          </div>
        ) : null}

        {missionHeading || missionBody ? (
          <div className="space-y-3 pt-2">
            {missionHeading ? (
              <h2 className="font-display text-sm font-black uppercase tracking-[0.15em] text-foreground md:text-base">
                {missionHeading}
              </h2>
            ) : null}
            {missionBody ? (
              <p className="text-sm leading-relaxed text-foreground/85 md:text-base whitespace-pre-line">
                {missionBody}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {partnerLogos.length > 0 ? (
        <div className="mt-auto space-y-4">
          {logosIntro ? (
            <p className="text-sm leading-relaxed text-foreground/75 md:text-base">
              {logosIntro}
            </p>
          ) : null}

          <div className="rounded-2xl border-2 border-foreground/80 bg-background/70 px-5 py-6 md:px-8 md:py-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
              {partnerLogos.map((partner) => {
                const logo = (
                  <div className="relative flex h-10 w-full items-center justify-center md:h-12">
                    <Image
                      src={partner.logoUrl}
                      alt={partner.logoAlt || partner.name}
                      fill
                      className="object-contain object-center"
                      sizes="120px"
                    />
                  </div>
                );

                return partner.url ? (
                  <Link
                    key={partner.name}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-70"
                    aria-label={partner.name}
                  >
                    {logo}
                  </Link>
                ) : (
                  <div key={partner.name}>{logo}</div>
                );
              })}
            </div>

            {logoBoxLabel ? (
              <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-[0.35em] text-foreground/60">
                {logoBoxLabel}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {contactEmail || bookingEmail ? (
        <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-foreground/15 pt-6 text-sm">
          {contactEmail ? (
            <p>
              <span className="mr-2 text-foreground/50">Email</span>
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
            </p>
          ) : null}
          {bookingEmail ? (
            <p>
              <span className="mr-2 text-foreground/50">Booking</span>
              <a
                href={`mailto:${bookingEmail}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {bookingEmail}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
