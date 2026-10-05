"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { getMedia, site } from "@/content/site";
import { useVitals } from "@/components/VitalsShell";
import { SequencePlayer } from "@/components/SequencePlayer";
import type { ChapterId } from "@/lib/calm";

function useChapterObserver(
  id: ChapterId,
  ref: React.RefObject<HTMLElement | null>
) {
  const { setChapter } = useVitals();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let killed = false;
    let st: { kill: () => void } | null = null;

    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (killed || !ref.current) return;
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({
        trigger: ref.current,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: () => setChapter(id),
        onEnterBack: () => setChapter(id),
      });
    });

    return () => {
      killed = true;
      st?.kill();
    };
  }, [id, ref, setChapter]);
}

/** Unlabeled progress cue — thin fill only. */
export function VisitProgress() {
  const { storyProgress, chapter } = useVitals();
  const inStory = [
    "concern",
    "consultation",
    "diagnosis",
    "treatment",
    "recovery",
    "close",
  ].includes(chapter);

  if (!inStory) return null;

  return (
    <div
      className="pointer-events-none fixed right-3 top-1/2 z-[58] hidden h-[28vh] w-px -translate-y-1/2 overflow-hidden bg-ink/10 md:right-5 md:block lg:right-8"
      aria-hidden
    >
      <div
        className="w-full origin-top bg-teal transition-[height] duration-500 ease-out"
        style={{ height: `${Math.round(storyProgress * 100)}%` }}
      />
    </div>
  );
}

/**
 * Signature 1 — Cold open.
 * Living pet flipbook already full behind the title. Type enters above it.
 * Scroll only softens the copy away — the sequence stays edge to edge.
 */
export function ColdOpenHero() {
  const root = useRef<HTMLElement>(null);
  const { awakened, introComplete, fontWeight, reducedMotion } = useVitals();

  useChapterObserver("hero", root);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reducedMotion || !introComplete) return;
    let ctx: gsap.Context | undefined;
    // Sync set keeps type invisible for this paint; async ScrollTrigger only for scrub.
    ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-line",
        { y: 48, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.15,
          stagger: 0.14,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }, el);

    let scrubCtx: gsap.Context | undefined;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      scrubCtx = gsap.context(() => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          })
          .fromTo(
            ".hero-copy",
            { y: 0, opacity: 1 },
            { y: -40, opacity: 0, ease: "none" },
            0
          )
          .fromTo(
            ".hero-veil",
            { opacity: 1 },
            { opacity: 0.45, ease: "none" },
            0
          );
      }, el);
    });

    return () => {
      ctx?.revert();
      scrubCtx?.revert();
    };
  }, [reducedMotion, introComplete]);

  return (
    <section
      id="top"
      ref={root}
      data-scene="open"
      className="relative min-h-[115svh] overflow-hidden bg-ink text-ivory"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="hero-still absolute inset-0">
          <SequencePlayer
            startPrefix="https://kindredpetcare.com/animations/allpets/start/"
            startCount={17}
            loopPrefix="https://kindredpetcare.com/animations/allpets/loop/"
            loopCount={96}
            startIndex={1}
            intervalMs={80}
            duplicateFirst
            extension="jpg"
            reducedMotion={reducedMotion}
            playbackEnabled={introComplete}
            stillSrc="https://kindredpetcare.com/animations/allpets/start/01.jpg"
            alt="Warm bond between people and their animals"
            className="absolute inset-0"
          />
        </div>
        <div className="hero-veil absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-ink/35" />

        <div className="hero-copy relative z-10 flex h-full max-w-[44rem] flex-col justify-end px-5 pb-28 pt-36 md:px-10 md:pb-24 lg:px-16">
          <p className="hero-line text-[0.93rem] uppercase tracking-wideish text-teal-mist/85">
            {site.brand.name}
            <span className="mx-2 text-ivory/30">·</span>
            {site.hero.eyebrow}
          </p>
          <h1
            className="hero-line mt-6 font-display text-[clamp(2.65rem,calc(6.2vw+4px),5.05rem)] leading-[0.98] tracking-tightish text-ivory"
            style={{ fontVariationSettings: `'wght' ${fontWeight}` }}
          >
            {site.hero.headline}
          </h1>
          <p className="hero-line mt-6 font-display text-[clamp(1.5rem,calc(2.6vw+4px),2.1rem)] leading-snug text-teal-mist">
            {site.hero.support}
          </p>
          <p
            className={`hero-line mt-12 text-[1.15rem] tracking-wide text-ivory/45 transition-opacity duration-1000 ${
              awakened ? "opacity-0" : "opacity-100"
            }`}
          >
            {site.hero.waitHint}
          </p>
        </div>
      </div>
    </section>
  );
}

function ConcernScene({
  chapter,
  index,
}: {
  chapter: (typeof site.chapters)[number];
  index: number;
}) {
  const root = useRef<HTMLElement>(null);
  const { fontWeight, reducedMotion } = useVitals();
  const asset = getMedia(chapter.image);

  useChapterObserver(chapter.signal, root);
  useStoryProgress(root, index);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion) return;
    let ctx: gsap.Context | undefined;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".concern-img",
          { scale: 1.18, xPercent: -4 },
          {
            scale: 1,
            xPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
        gsap.fromTo(
          ".concern-type",
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 70%",
              end: "center center",
              scrub: true,
            },
          }
        );
      }, el);
    });
    return () => ctx?.revert();
  }, [reducedMotion]);

  return (
    <section
      id={chapter.id}
      ref={root}
      data-scene={chapter.id}
      className="relative min-h-[100svh] overflow-hidden bg-ink text-ivory"
    >
      <div className="absolute inset-0">
        <div className="concern-img absolute inset-0 will-change-transform">
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            priority
            className="object-cover object-[40%_center] saturate-[0.45] contrast-[1.1] brightness-[0.88]"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />
      </div>

      <div className="concern-type relative z-10 flex min-h-[100svh] max-w-[36rem] flex-col justify-end px-5 pb-24 pt-32 md:px-10 lg:px-16">
        <time className="text-[0.93rem] uppercase tracking-wideish text-amber-soft/80">
          {chapter.timeLabel}
        </time>
        <p
          className="mt-5 font-display text-[clamp(2.25rem,calc(5vw+4px),3.85rem)] leading-[1.06] tracking-tightish"
          style={{ fontVariationSettings: `'wght' ${fontWeight}` }}
        >
          {chapter.line}
        </p>
        <p className="mt-6 max-w-sm text-[1.25rem] leading-relaxed text-ivory/55">
          {chapter.thought}
        </p>
      </div>
    </section>
  );
}

function ConsultationScene({
  chapter,
  index,
}: {
  chapter: (typeof site.chapters)[number];
  index: number;
}) {
  const root = useRef<HTMLElement>(null);
  const { fontWeight, reducedMotion, calm } = useVitals();
  const asset = getMedia(chapter.image);

  useChapterObserver(chapter.signal, root);
  useStoryProgress(root, index);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion) return;
    let ctx: gsap.Context | undefined;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".consult-mask",
          {
            clipPath: () =>
              window.innerWidth < 1024
                ? "inset(18% 0 0 0)"
                : "inset(0 35% 0 0)",
          },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "center center",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
        gsap.fromTo(
          ".consult-line",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 55%",
              end: "center 40%",
              scrub: true,
            },
          }
        );
      }, el);
    });
    return () => ctx?.revert();
  }, [reducedMotion]);

  return (
    <section
      id={chapter.id}
      ref={root}
      data-scene={chapter.id}
      className="relative min-h-[100svh] overflow-hidden bg-canvas"
    >
      <div className="mx-auto grid min-h-[100svh] max-w-[1440px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[58vh] lg:min-h-full">
          <div className="consult-mask absolute inset-0 will-change-[clip-path]">
            <Image
              src={asset.src}
              alt={asset.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </div>
        </div>

        <div className="relative flex flex-col justify-center px-5 py-16 md:px-10 lg:px-14 lg:py-24">
          <time className="text-[0.93rem] uppercase tracking-wideish text-teal">
            {chapter.timeLabel}
          </time>
          <p
            className="mt-6 font-display text-[clamp(1.95rem,calc(3.8vw+4px),3.15rem)] leading-[1.08] tracking-tightish text-ink"
            style={{ fontVariationSettings: `'wght' ${fontWeight}` }}
          >
            {chapter.line}
          </p>
          <div
            className="consult-line mt-9 h-px origin-left"
            style={{
              background: "var(--line-color)",
              width: `${40 + calm * 60}%`,
            }}
            aria-hidden
          />
          <p className="mt-9 max-w-md text-[1.27rem] leading-relaxed text-ink-muted">
            {chapter.thought}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Diagnosis Magic Lens — same flashlight reveal as recovery.
 * Cover photo hides the medical underlayer until the cursor burns a hole through.
 */
function DiagnosisScene({
  chapter,
  index,
}: {
  chapter: (typeof site.chapters)[number];
  index: number;
}) {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const { fontWeight, reducedMotion, calm, setChapter } = useVitals();
  const cover = getMedia(chapter.image);
  const secret =
    "secondaryImage" in chapter && chapter.secondaryImage
      ? getMedia(chapter.secondaryImage)
      : getMedia("seeing-under");
  const lensRadius = useRef(168);
  const activeRef = useRef(false);
  const rafRef = useRef(0);
  const posRef = useRef({ x: 0.55, y: 0.48 });

  useChapterObserver(chapter.signal, root);
  useStoryProgress(root, index);

  useEffect(() => {
    setChapter("diagnosis");
  }, [setChapter]);

  useEffect(() => {
    const updateRadius = () => {
      const base = Math.min(window.innerWidth, window.innerHeight);
      lensRadius.current = Math.round(
        Math.min(188, Math.max(96, base * 0.18))
      );
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    window.visualViewport?.addEventListener("resize", updateRadius);
    return () => {
      window.removeEventListener("resize", updateRadius);
      window.visualViewport?.removeEventListener("resize", updateRadius);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const paintLens = () => {
    const coverEl = coverRef.current;
    const stage = stageRef.current;
    if (!coverEl || !stage) return;
    const rect = stage.getBoundingClientRect();
    const x = posRef.current.x * rect.width;
    const y = posRef.current.y * rect.height;
    const r = activeRef.current ? lensRadius.current : 0;
    const feather = Math.max(18, r * 0.22);
    const mask =
      r <= 0
        ? "none"
        : `radial-gradient(circle ${r + feather}px at ${x}px ${y}px, transparent 0px, transparent ${r}px, #000 ${r + feather}px)`;
    coverEl.style.webkitMaskImage = mask;
    coverEl.style.maskImage = mask;
    coverEl.style.webkitMaskRepeat = "no-repeat";
    coverEl.style.maskRepeat = "no-repeat";
    coverEl.style.webkitMaskSize = "100% 100%";
    coverEl.style.maskSize = "100% 100%";
  };

  const schedulePaint = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      paintLens();
    });
  };

  const setPointerFromEvent = (e: React.PointerEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    posRef.current = {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    };
    schedulePaint();
  };

  const openLens = (e: React.PointerEvent) => {
    if (reducedMotion) return;
    activeRef.current = true;
    setPointerFromEvent(e);
  };

  const moveLens = (e: React.PointerEvent) => {
    if (reducedMotion) return;
    if (!activeRef.current) activeRef.current = true;
    setPointerFromEvent(e);
  };

  const closeLens = () => {
    if (reducedMotion) return;
    activeRef.current = false;
    schedulePaint();
  };

  return (
    <section
      id={chapter.id}
      ref={root}
      data-scene={chapter.id}
      className="relative min-h-[100svh] overflow-hidden bg-ink text-ivory"
    >
      <div
        ref={stageRef}
        className="absolute inset-0 touch-none select-none cursor-crosshair"
        onPointerEnter={openLens}
        onPointerMove={moveLens}
        onPointerDown={openLens}
        onPointerLeave={closeLens}
        onPointerCancel={closeLens}
        role="img"
        aria-label={`${cover.alt}. Move across the picture to reveal the medical view underneath.`}
      >
        <Image
          src={secret.src}
          alt={secret.alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(243,238,228,0.05) 6px, rgba(243,238,228,0.05) 7px)",
          }}
          aria-hidden
        />

        <div
          ref={coverRef}
          className="absolute inset-0"
          style={
            reducedMotion
              ? {
                  WebkitMaskImage:
                    "radial-gradient(circle 140px at 55% 48%, transparent 0px, transparent 100px, #000 140px)",
                  maskImage:
                    "radial-gradient(circle 140px at 55% 48%, transparent 0px, transparent 100px, #000 140px)",
                }
              : undefined
          }
        >
          <Image
            src={cover.src}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
            draggable={false}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/30" />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-[100svh] max-w-[34rem] flex-col justify-end px-5 pb-24 pt-32 md:px-10 lg:px-16">
        <time className="text-[0.93rem] uppercase tracking-wideish text-ivory/50">
          {chapter.timeLabel}
        </time>
        <p
          className="mt-5 font-display text-[clamp(2.1rem,calc(4.2vw+4px),3.35rem)] leading-[1.08] tracking-tightish"
          style={{ fontVariationSettings: `'wght' ${fontWeight}` }}
        >
          {chapter.line}
        </p>
        <p className="mt-6 text-[1.25rem] leading-relaxed text-ivory/60">
          {chapter.thought}
        </p>
        <div
          className="mt-9 h-px max-w-[10rem]"
          style={{
            background: "var(--line-color)",
            width: `${30 + (1 - calm) * 70}%`,
            opacity: 0.55,
          }}
          aria-hidden
        />
      </div>
    </section>
  );
}

function TreatmentScene({
  chapter,
  index,
}: {
  chapter: (typeof site.chapters)[number];
  index: number;
}) {
  const root = useRef<HTMLElement>(null);
  const { fontWeight, reducedMotion } = useVitals();
  const asset = getMedia(chapter.image);

  useChapterObserver(chapter.signal, root);
  useStoryProgress(root, index);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion) return;
    let ctx: gsap.Context | undefined;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".treat-img",
          { clipPath: "inset(12% 8% 12% 8%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "center center",
              scrub: true,
            },
          }
        );
        gsap.fromTo(
          ".treat-type",
          { x: 40, opacity: 0.2 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 60%",
              end: "center 45%",
              scrub: true,
            },
          }
        );
      }, el);
    });
    return () => ctx?.revert();
  }, [reducedMotion]);

  return (
    <section
      id={chapter.id}
      ref={root}
      data-scene={chapter.id}
      className="relative min-h-[100svh] overflow-hidden bg-canvas"
    >
      <div className="absolute inset-0 md:inset-y-0 md:left-0 md:right-[32%]">
        <div className="treat-img absolute inset-0 will-change-[clip-path]">
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
        </div>
      </div>

      <div className="treat-type relative z-10 flex min-h-[100svh] items-end px-5 pb-24 pt-[55vh] md:items-center md:justify-end md:px-10 md:pb-0 md:pt-0 lg:px-16">
        <div className="w-full max-w-md bg-canvas/95 p-6 md:bg-transparent md:p-0">
          <time className="text-[0.93rem] uppercase tracking-wideish text-teal">
            {chapter.timeLabel}
          </time>
          <p
            className="mt-5 font-display text-[clamp(2.25rem,calc(4.5vw+4px),3.65rem)] leading-[1.06] tracking-tightish text-ink"
            style={{ fontVariationSettings: `'wght' ${fontWeight}` }}
          >
            {chapter.line}
          </p>
          <p className="mt-6 text-[1.27rem] leading-relaxed text-ink-muted">
            {chapter.thought}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Magic Lens Reveal — cover photo fully hides a second photo underneath.
 * The pointer burns a soft circular hole through the top layer so the
 * secret image peeks through wherever you move.
 */
function RecoveryScene({
  chapter,
  index,
}: {
  chapter: (typeof site.chapters)[number];
  index: number;
}) {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const { fontWeight, reducedMotion, calm } = useVitals();
  const cover = getMedia(chapter.image);
  const secret =
    "secondaryImage" in chapter && chapter.secondaryImage
      ? getMedia(chapter.secondaryImage)
      : getMedia("03-recovery");
  const lensRadius = useRef(168);
  const activeRef = useRef(false);
  const rafRef = useRef(0);
  const posRef = useRef({ x: 0.5, y: 0.5 });

  useChapterObserver(chapter.signal, root);
  useStoryProgress(root, index);

  useEffect(() => {
    const updateRadius = () => {
      const base = Math.min(window.innerWidth, window.innerHeight);
      lensRadius.current = Math.round(
        Math.min(188, Math.max(96, base * 0.18))
      );
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    window.visualViewport?.addEventListener("resize", updateRadius);
    return () => {
      window.removeEventListener("resize", updateRadius);
      window.visualViewport?.removeEventListener("resize", updateRadius);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const paintLens = () => {
    const coverEl = coverRef.current;
    const stage = stageRef.current;
    if (!coverEl || !stage) return;
    const rect = stage.getBoundingClientRect();
    const x = posRef.current.x * rect.width;
    const y = posRef.current.y * rect.height;
    const r = activeRef.current ? lensRadius.current : 0;
    const feather = Math.max(18, r * 0.22);
    const mask =
      r <= 0
        ? "none"
        : `radial-gradient(circle ${r + feather}px at ${x}px ${y}px, transparent 0px, transparent ${r}px, #000 ${r + feather}px)`;
    coverEl.style.webkitMaskImage = mask;
    coverEl.style.maskImage = mask;
    coverEl.style.webkitMaskRepeat = "no-repeat";
    coverEl.style.maskRepeat = "no-repeat";
    coverEl.style.webkitMaskSize = "100% 100%";
    coverEl.style.maskSize = "100% 100%";
  };

  const schedulePaint = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      paintLens();
    });
  };

  const setPointerFromEvent = (e: React.PointerEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    posRef.current = {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    };
    schedulePaint();
  };

  const openLens = (e: React.PointerEvent) => {
    if (reducedMotion) return;
    activeRef.current = true;
    setPointerFromEvent(e);
  };

  const moveLens = (e: React.PointerEvent) => {
    if (reducedMotion) return;
    if (!activeRef.current) activeRef.current = true;
    setPointerFromEvent(e);
  };

  const closeLens = () => {
    if (reducedMotion) return;
    activeRef.current = false;
    schedulePaint();
  };

  return (
    <section
      id={chapter.id}
      ref={root}
      data-scene={chapter.id}
      className="relative min-h-[100svh] overflow-hidden bg-ivory-soft"
    >
      <div
        ref={stageRef}
        className="absolute inset-0 touch-none select-none cursor-crosshair"
        onPointerEnter={openLens}
        onPointerMove={moveLens}
        onPointerDown={openLens}
        onPointerLeave={closeLens}
        onPointerCancel={closeLens}
        role="img"
        aria-label={`${cover.alt}. Move across the picture to reveal another moment underneath.`}
      >
        {/* Secret photo — fully covered until the lens opens a window */}
        <Image
          src={secret.src}
          alt={secret.alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          draggable={false}
        />

        {/* Cover photo — sits on top; mask punches the flashlight hole */}
        <div
          ref={coverRef}
          className="absolute inset-0"
          style={
            reducedMotion
              ? {
                  WebkitMaskImage:
                    "radial-gradient(circle 140px at 62% 48%, transparent 0px, transparent 100px, #000 140px)",
                  maskImage:
                    "radial-gradient(circle 140px at 62% 48%, transparent 0px, transparent 100px, #000 140px)",
                }
              : undefined
          }
        >
          <Image
            src={cover.src}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
            draggable={false}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-24 pt-32 md:max-w-[40rem] md:px-10 lg:px-16">
        <time className="text-[0.93rem] uppercase tracking-wideish text-teal">
          {chapter.timeLabel}
        </time>
        <p
          className="mt-5 font-display text-[clamp(2.15rem,calc(4.5vw+4px),3.55rem)] leading-[1.08] tracking-tightish text-ink"
          style={{ fontVariationSettings: `'wght' ${fontWeight}` }}
        >
          {chapter.line}
        </p>
        <p className="mt-6 text-[1.27rem] leading-relaxed text-ink-muted">
          {chapter.thought}
        </p>
        <div
          className="mt-9 h-px origin-left bg-teal transition-all duration-700"
          style={{ width: `${20 + calm * 70}%`, opacity: 0.35 + calm * 0.5 }}
          aria-hidden
        />
      </div>
    </section>
  );
}

function useStoryProgress(
  ref: React.RefObject<HTMLElement | null>,
  index: number
) {
  const { setStoryProgress } = useVitals();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let killed = false;
    let st: { kill: () => void } | null = null;
    const total = site.chapters.length;

    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (killed || !ref.current) return;
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({
        trigger: ref.current,
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => {
          const base = index / total;
          const span = 1 / total;
          setStoryProgress(Math.min(1, base + self.progress * span * 0.95));
        },
      });
    });

    return () => {
      killed = true;
      st?.kill();
    };
  }, [index, ref, setStoryProgress]);
}

export function VitalsChapters() {
  return (
    <div id="the-visit">
      {site.chapters.map((chapter, index) => {
        switch (chapter.id) {
          case "concern":
            return (
              <ConcernScene key={chapter.id} chapter={chapter} index={index} />
            );
          case "consultation":
            return (
              <ConsultationScene
                key={chapter.id}
                chapter={chapter}
                index={index}
              />
            );
          case "diagnosis":
            return (
              <DiagnosisScene
                key={chapter.id}
                chapter={chapter}
                index={index}
              />
            );
          case "treatment":
            return (
              <TreatmentScene
                key={chapter.id}
                chapter={chapter}
                index={index}
              />
            );
          case "recovery":
            return (
              <RecoveryScene key={chapter.id} chapter={chapter} index={index} />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/**
 * Signature 5 lead-in — Bond → Trust → Home as one pinned visual sequence,
 * not a card gallery.
 */
export function EmotionalCenter() {
  const root = useRef<HTMLElement>(null);
  const { reducedMotion, setChapter } = useVitals();

  useChapterObserver("close", root);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (reducedMotion) {
      setChapter("close");
      return;
    }

    let ctx: gsap.Context | undefined;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const beats = gsap.utils.toArray<HTMLElement>(".emo-beat");
        if (beats.length < 2) return;

        gsap.set(beats.slice(1), { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () =>
              `+=${window.innerHeight * (window.innerWidth < 640 ? 2.6 : 2.2)}`,
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: () => setChapter("close"),
            onEnterBack: () => setChapter("close"),
          },
        });

        beats.forEach((beat, i) => {
          if (i === 0) return;
          const prev = beats[i - 1];
          tl.to(prev, { opacity: 0, duration: 0.45, ease: "none" }, i - 0.2);
          tl.to(beat, { opacity: 1, duration: 0.45, ease: "none" }, i - 0.2);
          tl.fromTo(
            beat.querySelector(".emo-img"),
            { scale: 1.08 },
            { scale: 1, duration: 0.45, ease: "none" },
            i - 0.2
          );
        });
      }, el);
    });
    return () => ctx?.revert();
  }, [reducedMotion, setChapter]);

  if (reducedMotion) {
    return (
      <section
        id="after-the-visit"
        ref={root}
        className="bg-ink text-ivory"
      >
        {site.emotionalCenter.beats.map((beat) => {
          const frame = getMedia(beat.image);
          return (
            <div key={beat.id} className="relative min-h-[70svh] overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src={frame.src}
                  alt={frame.alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 px-5 pb-16 md:px-10">
                <p className="max-w-xl font-display text-[clamp(1.85rem,calc(3.5vw+4px),2.65rem)] leading-snug">
                  {beat.line}
                </p>
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  return (
    <section
      id="after-the-visit"
      ref={root}
      className="relative h-[100svh] overflow-hidden bg-ink text-ivory"
    >
      {site.emotionalCenter.beats.map((beat, i) => {
        const frame = getMedia(beat.image);
        return (
          <div key={beat.id} className="emo-beat absolute inset-0">
            <div className="emo-img absolute inset-0">
              <Image
                src={frame.src}
                alt={frame.alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/20" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-20 md:px-10 lg:px-16">
              <p className="max-w-xl font-display text-[clamp(2.05rem,calc(4vw+4px),3.25rem)] leading-snug text-ivory/92">
                {beat.line}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/** Visual return — quiet cat sequence behind the parting title. */
export function ClosingLoop() {
  const root = useRef<HTMLElement>(null);
  const { setChapter, fontWeight, calm, setStoryProgress, reducedMotion } =
    useVitals();

  useChapterObserver("close", root);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let killed = false;
    let st: { kill: () => void } | null = null;
    let ctx: gsap.Context | undefined;

    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (killed || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({
        trigger: root.current,
        start: "top 60%",
        onEnter: () => {
          setChapter("close");
          setStoryProgress(1);
        },
        onEnterBack: () => setChapter("close"),
      });

      if (!reducedMotion) {
        ctx = gsap.context(() => {
          const sideInset = () =>
            window.innerWidth < 640 ? "6% 8% 8% 8%" : "8% 18% 12% 18%";
          gsap.fromTo(
            ".close-frame",
            { clipPath: "inset(0% 0% 0% 0%)", scale: 1.04 },
            {
              clipPath: () => `inset(${sideInset()})`,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top 80%",
                end: "center center",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }, el);
      }
    });

    return () => {
      killed = true;
      st?.kill();
      ctx?.revert();
    };
  }, [setChapter, setStoryProgress, reducedMotion]);

  return (
    <section
      id="contact"
      ref={root}
      data-scene="close"
      className="relative min-h-[100svh] overflow-hidden bg-ink text-ivory"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="close-frame absolute inset-0 overflow-hidden">
          <SequencePlayer
            startPrefix="https://kindredpetcare.com/animations/cat/start/"
            startCount={70}
            loopPrefix="https://kindredpetcare.com/animations/cat/loop/"
            loopCount={83}
            startIndex={1}
            intervalMs={80}
            duplicateFirst
            extension="png"
            reducedMotion={reducedMotion}
            stillSrc="https://kindredpetcare.com/animations/cat/start/01.png"
            alt="A calm cat at rest after care"
            className="absolute inset-0"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/45" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-[42rem] flex-col items-start justify-end px-5 pb-28 pt-36 md:justify-center md:px-10 md:pb-24 lg:px-16">
        <h2
          className="font-display text-[clamp(2.45rem,calc(5.5vw+4px),4.45rem)] leading-[1.02] tracking-tightish"
          style={{ fontVariationSettings: `'wght' ${fontWeight}` }}
        >
          {site.ending.headline}
        </h2>
        <p
          className={`mt-9 text-[1.03rem] uppercase tracking-wideish text-teal-mist transition-opacity duration-1000 ${
            calm > 0.88 ? "opacity-100" : "opacity-0"
          }`}
        >
          {site.ending.steadyTag}
        </p>
        <div className="mt-12 flex flex-wrap gap-3">
          <a
            href="#location"
            className="magnetic-item bg-ivory px-5 py-4 text-[1rem] font-semibold uppercase tracking-wideish text-ink transition hover:bg-teal-mist"
          >
            {site.ending.appointmentCta}
          </a>
          <a
            href="#emergency"
            className="magnetic-item bg-amber px-5 py-4 text-[1rem] font-semibold uppercase tracking-wideish text-ivory transition hover:bg-amber-deep"
          >
            {site.ending.emergencyCta}
          </a>
        </div>
      </div>
    </section>
  );
}
