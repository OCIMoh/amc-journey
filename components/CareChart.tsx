"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { getMedia, site } from "@/content/site";
import { useVitals } from "@/components/VitalsShell";

type LayoutMetrics = {
  mediaWidth: number;
  mediaHeight: number;
  gap: number;
  startX: number;
  padX: number;
  labelFont: number;
  labelMaxHeight: number;
  pinDistance: number;
  cardMax: number;
};

function readLayout(count: number, section: HTMLElement, trackArea: HTMLElement | null): LayoutMetrics {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const short = h < 640;
  const narrow = w < 640;
  const mid = w < 960;

  const padX = narrow ? 20 : mid ? 40 : 64;
  const introReserve = short ? h * 0.28 : narrow ? h * 0.34 : h * 0.3;
  const bottomPad = short ? 48 : narrow ? 64 : 80;
  const availableForLabels = Math.max(
    180,
    (trackArea?.clientHeight || h - introReserve) - 12
  );

  const mediaWidth = Math.round(
    Math.min(
      narrow ? w * 0.46 : mid ? w * 0.36 : w * 0.34,
      narrow ? 200 : mid ? 240 : 280
    )
  );
  const mediaHeight = Math.round(
    Math.min(
      short ? h * 0.36 : narrow ? h * 0.42 : h * 0.48,
      narrow ? 300 : 420
    )
  );

  const gap = Math.round(narrow ? Math.max(28, w * 0.06) : mid ? Math.max(36, w * 0.05) : Math.max(44, w * 0.055));
  const startX = Math.min(padX, w * 0.04);
  const labelFont = narrow ? 15 : mid ? 18 : 20;

  // Longest vertical name must fit in the remaining strip height.
  const longest = Math.max(...site.services.map((s) => s.title.length), 12);
  const naturalLabel = longest * labelFont * 0.62;
  const labelScale = Math.min(1, availableForLabels / naturalLabel);
  const fittedFont = Math.max(12, Math.round(labelFont * labelScale));

  const pinDistance = Math.max(
    h * (narrow ? 2.8 : 2.2),
    count * h * (narrow ? 0.95 : 0.85)
  );

  return {
    mediaWidth,
    mediaHeight,
    gap,
    startX,
    padX,
    labelFont: fittedFont,
    labelMaxHeight: availableForLabels,
    pinDistance,
    cardMax: Math.min(220, w - 32),
  };
}

/**
 * Care areas — Studio Loop–style gallery:
 * pin the section, slide the name row sideways from vertical scroll,
 * show only the focused care’s tall photo, keep hover/tap description card.
 * Layout and motion distances recompute on every resize so the effect stays consistent.
 */
export function CareChart() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const trackArea = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const metricsRef = useRef<LayoutMetrics | null>(null);
  const { setChapter, reducedMotion } = useVitals();
  const services = site.services;
  const count = services.length;

  const [focusIndex, setFocusIndex] = useState(0);
  const [metrics, setMetrics] = useState<LayoutMetrics | null>(null);
  const [card, setCard] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const activeId = useMemo(() => {
    if (card?.id) return card.id;
    return services[Math.min(focusIndex, count - 1)]?.id ?? null;
  }, [card, focusIndex, services, count]);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setChapter("services");
      },
      { threshold: 0.12 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [setChapter]);

  useEffect(() => {
    const section = root.current;
    if (!section) return;

    const syncMetrics = () => {
      const next = readLayout(count, section, trackArea.current);
      metricsRef.current = next;
      setMetrics(next);
      if (track.current) {
        track.current.style.gap = `${next.gap}px`;
        track.current.style.paddingLeft = `${next.padX}px`;
        track.current.style.paddingRight = `${next.padX}px`;
      }
      mediaRefs.current.forEach((el) => {
        if (!el) return;
        el.style.height = `${next.mediaHeight}px`;
      });
      return next;
    };

    syncMetrics();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        syncMetrics();
        void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          ScrollTrigger.refresh();
        });
      }, 80);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [count]);

  useEffect(() => {
    if (reducedMotion) {
      setFocusIndex(0);
      const m = metricsRef.current;
      const w = m?.mediaWidth ?? Math.min(window.innerWidth * 0.34, 280);
      mediaRefs.current.forEach((el, i) => {
        if (!el) return;
        const on = i === 0;
        el.style.width = on ? `${w}px` : "0px";
        el.style.opacity = on ? "1" : "0";
        el.style.marginLeft = on ? "1rem" : "0px";
        if (m) el.style.height = `${m.mediaHeight}px`;
      });
      return;
    }

    const section = root.current;
    const row = track.current;
    if (!section || !row) return;

    let ctx: gsap.Context | undefined;
    let killed = false;

    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const pinDistance = () =>
          metricsRef.current?.pinDistance ??
          Math.max(window.innerHeight * 2.2, count * window.innerHeight * 0.85);

        const maxShift = () => {
          const overflow = Math.max(0, row.scrollWidth - window.innerWidth + 48);
          return overflow;
        };

        const mediaWidth = () =>
          metricsRef.current?.mediaWidth ??
          Math.min(window.innerWidth * 0.34, 280);

        const applyProgress = (progress: number) => {
          const p = Math.min(1, Math.max(0, progress));
          const focusFloat = p * (count - 1);
          const nearest = Math.min(
            count - 1,
            Math.max(0, Math.round(focusFloat))
          );
          setFocusIndex(nearest);

          const mw = mediaWidth();
          mediaRefs.current.forEach((el, i) => {
            if (!el) return;
            const distance = Math.abs(i - focusFloat);
            const weight = Math.max(0, 1 - distance / 0.85);
            const eased = weight * weight * (3 - 2 * weight);
            const open = mw * eased;
            el.style.width = `${open}px`;
            el.style.opacity = String(eased);
            el.style.marginLeft = eased > 0.02 ? `${0.75 + eased * 0.25}rem` : "0px";
            el.style.pointerEvents = eased > 0.35 ? "auto" : "none";
            if (metricsRef.current) {
              el.style.height = `${metricsRef.current.mediaHeight}px`;
            }
          });
        };

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${pinDistance()}`,
          pin: true,
          scrub: 1.05,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => applyProgress(self.progress),
          onRefresh: (self) => applyProgress(self.progress),
        });

        gsap.fromTo(
          row,
          { x: () => metricsRef.current?.startX ?? Math.min(48, window.innerWidth * 0.04) },
          {
            x: () => -maxShift(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${pinDistance()}`,
              scrub: 1.05,
              invalidateOnRefresh: true,
            },
          }
        );

        applyProgress(0);
      }, section);

      ScrollTrigger.refresh();
    });

    return () => {
      killed = true;
      ctx?.revert();
    };
  }, [reducedMotion, count]);

  const placeCard = (id: string, clientX?: number, clientY?: number) => {
    if (typeof clientX === "number" && typeof clientY === "number" && root.current) {
      const rect = root.current.getBoundingClientRect();
      const maxW = metrics?.cardMax ?? 220;
      setCard({
        id,
        x: Math.min(Math.max(clientX - rect.left + 18, 12), Math.max(12, rect.width - maxW - 12)),
        y: Math.min(Math.max(clientY - rect.top + 18, 12), rect.height - 140),
      });
    } else {
      setCard({ id, x: 24, y: 100 });
    }
  };

  const clearCard = () => setCard(null);

  const activeService = services.find((s) => s.id === (card?.id ?? activeId));
  const labelFont = metrics?.labelFont ?? 18;
  const labelMaxHeight = metrics?.labelMaxHeight ?? 360;
  const mediaHeight = metrics?.mediaHeight ?? 360;
  const mediaWidthInit = metrics?.mediaWidth ?? 240;

  return (
    <section
      id="care"
      ref={root}
      className="relative z-[2] overflow-x-clip bg-canvas text-ink"
      aria-label="Care areas"
      onMouseLeave={clearCard}
    >
      <div className="relative flex h-[100svh] max-h-[100dvh] flex-col overflow-hidden">
        <div
          ref={intro}
          className="shrink-0 px-5 pt-12 md:px-10 md:pt-16 lg:px-16"
          style={{ paddingLeft: metrics?.padX, paddingRight: metrics?.padX }}
        >
          <p className="text-[0.97rem] uppercase tracking-wideish text-ink-soft">
            Care areas
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-[clamp(1.8rem,calc(4.2vw+4px),3.45rem)] leading-[1.08] tracking-tightish text-ink md:mt-4">
            {site.servicesIntro.title}
          </h2>
          <p className="mt-4 max-w-xl text-[1.17rem] leading-relaxed text-ink-muted md:mt-5 md:text-[1.23rem]">
            {site.servicesIntro.body}
          </p>
        </div>

        <div
          ref={trackArea}
          className="relative mt-auto flex min-h-0 flex-1 items-end overflow-x-clip overflow-y-visible pb-12 md:pb-20"
        >
          <div
            ref={track}
            className="flex w-max items-end overflow-visible will-change-transform"
            style={{
              gap: metrics ? `${metrics.gap}px` : "clamp(1.75rem, 5.5vw, 5rem)",
              paddingLeft: metrics?.padX ?? undefined,
              paddingRight: metrics?.padX ?? undefined,
            }}
          >
            {services.map((service, index) => {
              const asset = getMedia(service.image);
              const focused = index === focusIndex;
              const on = card?.id === service.id || (!card && focused);

              return (
                <button
                  key={service.id}
                  type="button"
                  data-service-id={service.id}
                  className="group relative flex shrink-0 flex-row items-end overflow-visible border-0 bg-transparent p-0 text-left outline-none"
                  onMouseEnter={(e) => placeCard(service.id, e.clientX, e.clientY)}
                  onMouseMove={(e) => placeCard(service.id, e.clientX, e.clientY)}
                  onFocus={() => placeCard(service.id)}
                  onClick={(e) => {
                    if (card?.id === service.id) {
                      clearCard();
                      return;
                    }
                    placeCard(service.id, e.clientX, e.clientY);
                  }}
                  aria-pressed={on}
                  aria-label={`${service.title}. ${service.body}`}
                >
                  <p
                    className={`origin-bottom whitespace-nowrap font-display leading-[1.2] tracking-tightish transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      on ? "text-ink" : focused ? "text-ink/80" : "text-ink/40"
                    }`}
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      fontSize: `${labelFont}px`,
                      maxHeight: `${labelMaxHeight}px`,
                      height: "auto",
                      paddingBlock: "0.15em",
                    }}
                  >
                    {service.title}
                  </p>

                  <div
                    ref={(el) => {
                      mediaRefs.current[index] = el;
                    }}
                    className="relative overflow-hidden"
                    style={{
                      width: index === 0 ? `${mediaWidthInit}px` : "0px",
                      height: `${mediaHeight}px`,
                      opacity: index === 0 ? 1 : 0,
                      marginLeft: index === 0 ? "1rem" : "0px",
                      willChange: "width, opacity, margin",
                    }}
                    aria-hidden={!focused}
                  >
                    <Image
                      src={asset.src}
                      alt={asset.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 200px, 280px"
                      style={{
                        objectPosition: "40% 35%",
                      }}
                      priority={index === 0}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {activeService && card ? (
          <div
            className="pointer-events-none absolute z-20 rounded-sm bg-canvas/95 px-3.5 py-3 shadow-[0_10px_40px_rgba(20,16,12,0.18)] ring-1 ring-ink/10 backdrop-blur-sm"
            style={{
              left: card.x,
              top: card.y,
              maxWidth: metrics?.cardMax ?? 216,
            }}
          >
            <p className="font-display text-[1.17rem] leading-snug text-ink">
              {activeService.title}
            </p>
            <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-muted">
              {activeService.body}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
