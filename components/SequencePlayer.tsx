"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SequencePlayerProps = {
  /** Directory prefix, e.g. /animations/allpets/start/ */
  startPrefix: string;
  startCount: number;
  loopPrefix: string;
  loopCount: number;
  /** First frame number in the sequence (Kindred allpets starts at 1). */
  startIndex?: number;
  /**
   * Milliseconds between frames — Kindred pet family uses 80.
   * Prefer this over fps when matching Kindred.
   */
  intervalMs?: number;
  /** @deprecated Use intervalMs. Kept so older call sites still compile. */
  fps?: number;
  extension?: "jpg" | "png" | "webp";
  className?: string;
  alt?: string;
  reducedMotion?: boolean;
  stillSrc?: string;
  /**
   * Kindred duplicates the first file as data-index 0 and 1
   * so the handoff into each stack feels smooth.
   */
  duplicateFirst?: boolean;
  /**
   * When false, frames may warm/preload but playback stays on the first still.
   * Used to hold the hero pet sequence until the entrance finishes.
   */
  playbackEnabled?: boolean;
};

/** Kindred naming: 01–09, then 010, 011, … */
export function kindredPad(n: number) {
  if (n < 10) return String(n).padStart(2, "0");
  return String(n).padStart(3, "0");
}

function buildFrameSrcs(
  prefix: string,
  count: number,
  startIndex: number,
  extension: string,
  duplicateFirst: boolean
) {
  const unique = Array.from(
    { length: count },
    (_, i) => `${prefix}${kindredPad(startIndex + i)}.${extension}`
  );
  if (!duplicateFirst || unique.length === 0) return unique;
  return [unique[0], ...unique];
}

function isPaintReady(img: HTMLImageElement) {
  return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
}

/** Wait until the picture is fully ready to paint — not just “file arrived.” */
async function ensureDecoded(img: HTMLImageElement): Promise<boolean> {
  if (isPaintReady(img)) {
    try {
      if (typeof img.decode === "function") await img.decode();
    } catch {
      /* already painted or decode rejected after paint — still usable if sized */
    }
    return isPaintReady(img);
  }

  await new Promise<void>((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });

  if (!isPaintReady(img)) return false;

  try {
    if (typeof img.decode === "function") await img.decode();
  } catch {
    /* ignore */
  }
  return isPaintReady(img);
}

/**
 * Kindred-identical flipbook with a first-load gate:
 * every frame is a real <img> already in the page;
 * playback only shows one and hides the rest;
 * start plays once, then the loop stack repeats forever;
 * we never advance until the next frame can actually paint.
 */
export function SequencePlayer({
  startPrefix,
  startCount,
  loopPrefix,
  loopCount,
  startIndex = 1,
  intervalMs,
  fps,
  extension = "webp",
  className = "",
  alt = "",
  reducedMotion = false,
  stillSrc,
  duplicateFirst = true,
  playbackEnabled = true,
}: SequencePlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const startWrapRef = useRef<HTMLDivElement>(null);
  const loopWrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const playbackEnabledRef = useRef(playbackEnabled);
  const tryBeginRef = useRef<() => void>(() => {});

  useEffect(() => {
    playbackEnabledRef.current = playbackEnabled;
    if (playbackEnabled) tryBeginRef.current();
  }, [playbackEnabled]);

  const startSrcs = useMemo(
    () =>
      buildFrameSrcs(
        startPrefix,
        startCount,
        startIndex,
        extension,
        duplicateFirst
      ),
    [startPrefix, startCount, startIndex, extension, duplicateFirst]
  );
  const loopSrcs = useMemo(
    () =>
      buildFrameSrcs(
        loopPrefix,
        loopCount,
        startIndex,
        extension,
        duplicateFirst
      ),
    [loopPrefix, loopCount, startIndex, extension, duplicateFirst]
  );

  const still = stillSrc ?? startSrcs[0];
  const frameTime =
    typeof intervalMs === "number"
      ? intervalMs
      : typeof fps === "number"
        ? 1000 / fps
        : 80;

  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    const startWrap = startWrapRef.current;
    const loopWrap = loopWrapRef.current;
    if (!root || !startWrap || !loopWrap) return;

    const startImgs = Array.from(
      startWrap.querySelectorAll<HTMLImageElement>("img")
    );
    const loopImgs = Array.from(
      loopWrap.querySelectorAll<HTMLImageElement>("img")
    );

    const hideAll = (imgs: HTMLImageElement[]) => {
      for (const img of imgs) img.style.display = "none";
    };

    const showFrame = (stack: HTMLImageElement[], frame: HTMLImageElement) => {
      hideAll(stack);
      frame.style.display = "block";
    };

    // Hold the first opening picture while everything else warms.
    hideAll(startImgs);
    hideAll(loopImgs);
    if (startImgs[0]) startImgs[0].style.display = "block";
    startWrap.style.display = "block";
    loopWrap.style.display = "none";
    setReady(false);

    let cancelled = false;
    let started = false;
    let startTimer: ReturnType<typeof setInterval> | null = null;
    let loopTimer: ReturnType<typeof setInterval> | null = null;
    let io: IntersectionObserver | null = null;

    const warmStack = async (imgs: HTMLImageElement[]) => {
      const ok: HTMLImageElement[] = [];
      // Decode in small batches so we do not starve the first paint.
      const batchSize = 8;
      for (let i = 0; i < imgs.length; i += batchSize) {
        if (cancelled) break;
        const slice = imgs.slice(i, i + batchSize);
        // Force the browser to fetch even if display:none.
        slice.forEach((img) => {
          img.loading = "eager";
          if (!img.src && img.dataset.src) img.src = img.dataset.src;
        });
        const results = await Promise.all(slice.map((img) => ensureDecoded(img)));
        slice.forEach((img, j) => {
          if (results[j]) ok.push(img);
        });
      }
      return ok;
    };

    const playLoop = (
      stack: HTMLImageElement[],
      playable: HTMLImageElement[]
    ) => {
      if (cancelled || playable.length === 0) return;
      startWrap.style.display = "none";
      loopWrap.style.display = "block";
      showFrame(stack, playable[0]);
      let current = 0;
      loopTimer = setInterval(() => {
        if (cancelled) return;
        let guard = 0;
        do {
          if (current >= playable.length) current = 0;
          if (isPaintReady(playable[current])) break;
          current += 1;
          guard += 1;
        } while (guard < playable.length);
        if (!isPaintReady(playable[current])) return;
        showFrame(stack, playable[current]);
        current += 1;
      }, frameTime);
    };

    let loopReadyPromise: Promise<HTMLImageElement[]> | null = null;

    const playStart = (
      startStack: HTMLImageElement[],
      startPlayable: HTMLImageElement[],
      loopStack: HTMLImageElement[]
    ) => {
      if (cancelled || startPlayable.length === 0) {
        void (async () => {
          const loopReady = (await loopReadyPromise) ?? [];
          playLoop(loopStack, loopReady);
        })();
        return;
      }
      showFrame(startStack, startPlayable[0]);
      let current = 0;
      startTimer = setInterval(() => {
        if (cancelled) return;
        if (current >= startPlayable.length) {
          if (startTimer) clearInterval(startTimer);
          startTimer = null;
          void (async () => {
            // Hold the last opening picture until the loop stack can paint.
            const loopReady = (await loopReadyPromise) ?? [];
            if (cancelled) return;
            if (loopReady.length === 0) return;
            playLoop(loopStack, loopReady);
          })();
          return;
        }
        if (!isPaintReady(startPlayable[current])) {
          // Skip empty / failed frames — never flash the dark page.
          current += 1;
          return;
        }
        showFrame(startStack, startPlayable[current]);
        current += 1;
      }, frameTime);
    };

    void (async () => {
      // First picture must be solid before we claim ready.
      const firstOk = startImgs[0]
        ? await ensureDecoded(startImgs[0])
        : false;
      if (cancelled) return;
      if (firstOk) setReady(true);

      // Warm loop in the background while the opening stack finishes.
      loopReadyPromise = warmStack(loopImgs);

      const startPlayable = await warmStack(startImgs);
      if (cancelled) return;

      const startReady =
        startPlayable.length > 0
          ? startPlayable
          : startImgs.filter(isPaintReady);

      if (startReady.length === 0) {
        const loopReady = await loopReadyPromise;
        if (loopReady.length === 0) return;
      }

      const begin = () => {
        if (started || cancelled) return;
        if (!playbackEnabledRef.current) return;
        started = true;
        playStart(startImgs, startReady, loopImgs);
      };
      tryBeginRef.current = begin;

      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) begin();
        },
        { threshold: 0.12 }
      );
      io.observe(root);

      // If already on screen (first load), start once the opening stack is ready.
      if (root.getBoundingClientRect().top < window.innerHeight * 0.88) {
        begin();
      }
    })();

    return () => {
      cancelled = true;
      tryBeginRef.current = () => {};
      if (startTimer) clearInterval(startTimer);
      if (loopTimer) clearInterval(loopTimer);
      io?.disconnect();
    };
  }, [startSrcs, loopSrcs, frameTime, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`relative h-full w-full overflow-hidden bg-[#2a241c] ${className}`}
      data-time={frameTime}
      data-ready={ready ? "1" : "0"}
    >
      {/* Permanent poster so the dark page never peeks through while warming. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={still}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[center_top] md:object-center"
        decoding="sync"
        fetchPriority="high"
        draggable={false}
      />

      {reducedMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={still}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover object-[center_top] md:object-center"
          decoding="sync"
          fetchPriority="high"
          draggable={false}
        />
      ) : (
        <>
          <div
            ref={startWrapRef}
            className="absolute inset-0"
            style={{ opacity: ready ? 1 : 0 }}
            aria-hidden={false}
          >
            {startSrcs.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`start-${i}-${src}`}
                src={src}
                alt={i === 0 ? alt : ""}
                data-index={i}
                className="absolute inset-0 h-full w-full object-cover object-[center_top] md:object-center"
                style={{ display: i === 0 ? "block" : "none" }}
                decoding={i === 0 ? "sync" : "async"}
                fetchPriority={i === 0 ? "high" : "low"}
                loading="eager"
                draggable={false}
              />
            ))}
          </div>
          <div
            ref={loopWrapRef}
            className="absolute inset-0"
            style={{ display: "none" }}
            aria-hidden
          >
            {loopSrcs.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`loop-${i}-${src}`}
                src={src}
                alt=""
                data-index={i}
                className="absolute inset-0 h-full w-full object-cover object-[center_top] md:object-center"
                style={{ display: i === 0 ? "block" : "none" }}
                decoding="async"
                loading="eager"
                draggable={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
