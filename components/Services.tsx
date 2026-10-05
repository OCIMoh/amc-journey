"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getMedia, site } from "@/content/site";

export function Services() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const current = site.services[active];
  const asset = getMedia(current.image);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ctx: gsap.Context;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        if (reduce) return;
        gsap.fromTo(
          ".svc-head",
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            scrollTrigger: { trigger: el, start: "top 70%" },
          }
        );
      }, el);
    });
    return () => ctx?.revert();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    gsap.fromTo(
      ".svc-visual",
      { opacity: 0.35, scale: 1.04 },
      { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" }
    );
    gsap.fromTo(
      ".svc-detail",
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" }
    );
  }, [active]);

  return (
    <section
      id="services"
      ref={root}
      className="relative overflow-hidden bg-teal-deep text-ivory"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(143,166,138,0.35), transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(140,181,167,0.18), transparent 45%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28 lg:px-16">
        <div className="svc-head max-w-3xl">
          <p className="text-[1rem] uppercase tracking-wideish text-teal-mist">
            Medical chapters
          </p>
          <h2 className="mt-5 font-display text-[clamp(2.35rem,calc(4.8vw+4px),3.85rem)] leading-[1.08] tracking-tightish">
            Capabilities as an editorial sequence — not a grid of cards.
          </h2>
          <p className="mt-6 max-w-2xl text-[1.27rem] leading-relaxed text-ivory/70">
            Move through AMC&apos;s care chapters. Each one opens into a large
            visual composition. These frames are campaign imagery and can be
            swapped for real clinic photography without rewriting the page.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {site.services.map((service, index) => {
              const isActive = index === active;
              return (
                <li key={service.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    className={`group flex w-full min-w-[220px] items-baseline gap-4 border-l-2 px-4 py-3 text-left transition lg:min-w-0 ${
                      isActive
                        ? "border-amber bg-ivory/5"
                        : "border-ivory/15 hover:border-ivory/40 hover:bg-ivory/[0.03]"
                    }`}
                  >
                    <span className="font-body text-[0.95rem] uppercase tracking-wideish text-ivory/45">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display text-[1.4rem] leading-snug md:text-[1.6rem] ${
                        isActive ? "text-ivory" : "text-ivory/65"
                      }`}
                    >
                      {service.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="relative">
            <div className="svc-visual relative aspect-[4/5] overflow-hidden md:aspect-[16/11]">
              <Image
                key={current.id}
                src={asset.src}
                alt={asset.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/80 via-teal-deep/15 to-transparent" />
              <div className="svc-detail absolute inset-x-0 bottom-0 p-6 md:p-10">
                <p className="text-[0.97rem] uppercase tracking-wideish text-amber-soft">
                  {current.accent ? "Primary pathway" : "Care chapter"}
                </p>
                <h3 className="mt-4 font-display text-[clamp(2.05rem,calc(3.5vw+4px),3.05rem)] leading-tight">
                  {current.title}
                </h3>
                <p className="mt-5 max-w-lg text-[1.25rem] leading-relaxed text-ivory/80">
                  {current.body}
                </p>
                {current.accent ? (
                  <a
                    href="#emergency"
                    className="mt-7 inline-flex rounded-sm bg-amber px-4 py-3.5 text-[0.97rem] font-semibold uppercase tracking-wideish text-ivory"
                  >
                    Open emergency path
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
