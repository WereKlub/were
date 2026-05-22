import Image from "next/image";
import { PortableText } from "@portabletext/react";

export type AboutTeamMember = {
  name: string;
  role: string;
  imageUrl?: string | null;
  imageAlt?: string;
};

interface AboutShowcasePanelProps {
  introLabel?: string;
  heading: string;
  body?: unknown;
  stats?: { value: string; label: string }[];
  teamHeading?: string;
  team?: AboutTeamMember[];
}

const panelProseClass =
  "prose prose-sm md:prose-base max-w-none prose-p:leading-relaxed prose-p:mb-4 prose-headings:font-display prose-headings:uppercase prose-strong:font-bold prose-p:text-inherit prose-headings:text-inherit prose-strong:text-inherit opacity-90 [&_p:last-child]:mb-0";

export function AboutShowcasePanel({
  introLabel,
  heading,
  body,
  stats = [],
  teamHeading,
  team = [],
}: AboutShowcasePanelProps) {
  return (
    <div className="flex min-h-full flex-col gap-10 md:gap-12">
      <div className="space-y-6 md:space-y-8">
        {introLabel ? (
          <p className="text-sm leading-relaxed opacity-75 md:text-base">
            {introLabel}
          </p>
        ) : null}

        <h1 className="font-display text-3xl font-black uppercase leading-[0.95] tracking-tight md:text-4xl lg:text-[2.75rem]">
          {heading}
        </h1>

        {body ? (
          <div className={panelProseClass}>
            <PortableText value={body as never} />
          </div>
        ) : null}
      </div>

      {stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 border-y border-current/15 py-8 md:grid-cols-4 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={`${stat.value}-${stat.label}-${index}`}
              className="text-center md:text-left"
            >
              <p className="font-display text-3xl font-black md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] opacity-60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {team.length > 0 ? (
        <div className="mt-auto space-y-5">
          {teamHeading ? (
            <h2 className="font-display text-sm font-black uppercase tracking-[0.15em] md:text-base">
              {teamHeading}
            </h2>
          ) : null}

          <div className="rounded-2xl border-2 border-current/80 bg-current/5 px-5 py-5 md:px-6 md:py-6">
            <div className="space-y-4">
              {team.map((member, index) => (
                <div
                  key={`${member.name}-${index}`}
                  className="flex items-center justify-between gap-4 border-b border-current/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {member.imageUrl ? (
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-current/20">
                        <Image
                          src={member.imageUrl}
                          alt={member.imageAlt || member.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : null}
                    <span className="truncate font-display font-bold">
                      {member.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-right text-sm opacity-70">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
