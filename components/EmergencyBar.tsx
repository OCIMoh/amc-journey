"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

export function EmergencyBar() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[65] transition-colors duration-500 ${
          solid ? "border-b border-ink/8 bg-canvas" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 md:px-8 lg:px-12">
          <a href="#top" className="flex flex-col">
            <span
              className={`font-display text-[1.4rem] leading-tight tracking-tightish md:text-[1.6rem] ${
                solid ? "text-ink" : "text-ivory"
              }`}
            >
              {site.brand.name}
            </span>
            <span
              className={`mt-1.5 text-[0.9rem] uppercase tracking-wideish ${
                solid ? "text-ink-soft" : "text-ivory/55"
              }`}
            >
              {site.brand.city}
            </span>
          </a>

          <nav
            className={`hidden items-center gap-9 text-[0.97rem] uppercase tracking-wideish md:flex ${
              solid ? "text-ink-muted" : "text-ivory/70"
            }`}
          >
            <a className="transition hover:text-teal" href="#care">
              Care
            </a>
            <a className="transition hover:text-teal" href="#location">
              Location
            </a>
          </nav>

          <a
            href={
              site.verified.phone
                ? `tel:${site.verified.phone.replace(/\s+/g, "")}`
                : "#emergency"
            }
            className="magnetic-item inline-flex items-center gap-2 bg-amber px-4 py-3 text-[0.95rem] font-semibold uppercase tracking-wideish text-ivory transition hover:bg-amber-deep"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ivory/70 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ivory" />
            </span>
            {site.hero.emergencyCta}
          </a>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-teal/15 bg-canvas p-3 md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={
              site.verified.phone
                ? `tel:${site.verified.phone.replace(/\s+/g, "")}`
                : "#emergency"
            }
            className="bg-amber px-3 py-3 text-center text-[1rem] font-semibold uppercase tracking-wideish text-ivory"
          >
            24/7 Emergency
          </a>
          <a
            href="#concern"
            className="bg-teal-deep px-3 py-3 text-center text-[1rem] font-semibold uppercase tracking-wideish text-ivory"
          >
            Begin
          </a>
        </div>
      </div>
    </>
  );
}
