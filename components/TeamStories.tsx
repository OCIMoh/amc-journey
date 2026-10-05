"use client";

import Image from "next/image";
import { getMedia, site } from "@/content/site";

/** Quiet hold for real staff photography — no fake portraits, no card grid. */
export function Team() {
  const hands = getMedia("02-hands");

  return (
    <section
      id="team"
      className="relative overflow-hidden bg-canvas px-5 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <p className="text-[0.93rem] uppercase tracking-wideish text-teal">
            People
          </p>
          <h2 className="mt-5 max-w-lg font-display text-[clamp(2.15rem,calc(4vw+4px),3.25rem)] leading-[1.08] tracking-tightish text-ink">
            {site.team.title}
          </h2>
          <p className="mt-6 max-w-md text-[1.27rem] leading-relaxed text-ink-muted">
            {site.team.body}
          </p>
        </div>

        <div className="relative aspect-[5/4] overflow-hidden md:aspect-[16/10]">
          <Image
            src={hands.src}
            alt={hands.alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
