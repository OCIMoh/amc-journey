"use client";

import { site } from "@/content/site";

/** Quiet educational block after Care areas — no new motion system. */
export function WhenToVisit() {
  return (
    <section
      id="when-to-visit"
      className="bg-ivory-soft px-5 py-16 md:px-10 md:py-20 lg:px-16"
    >
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="text-[0.97rem] uppercase tracking-wideish text-teal">
            Guidance
          </p>
          <h2 className="mt-4 max-w-xl font-display text-[clamp(1.95rem,calc(3.8vw+4px),2.85rem)] leading-[1.12] tracking-tightish text-ink">
            {site.whenToVisit.title}
          </h2>
          <p className="mt-5 max-w-lg text-[1.27rem] leading-relaxed text-ink-muted">
            {site.whenToVisit.body}
          </p>
          <div className="mt-9 max-w-lg border-t border-ink/10 pt-7">
            <h3 className="font-display text-[1.5rem] leading-snug text-ink">
              {site.whyVisitsMatter.title}
            </h3>
            <p className="mt-4 text-[1.23rem] leading-relaxed text-ink-muted">
              {site.whyVisitsMatter.body}
            </p>
          </div>
        </div>

        <ul className="space-y-4 self-center border border-ink/8 bg-canvas px-5 py-7 md:px-7 md:py-9">
          {site.whenToVisit.signs.map((sign) => (
            <li
              key={sign}
              className="flex gap-3 text-[1.2rem] leading-relaxed text-ink-muted"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber"
                aria-hidden
              />
              <span>{sign}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
