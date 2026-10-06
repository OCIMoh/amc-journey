"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Phase =
  | "black"
  | "playing"
  | "hold"
  | "sheet"
  | "paws"
  | "reveal"
  | "done";

type PawSpec = {
  src: string;
  left: string;
  top: string;
  size: string;
  rotate: number;
  opacity: number;
};

const PAWS: PawSpec[] = [
  { src: "/entrance/paws/dog.svg", left: "12%", top: "72%", size: "7.5rem", rotate: -18, opacity: 0.88 },
  { src: "/entrance/paws/cat.svg", left: "28%", top: "58%", size: "5.5rem", rotate: 12, opacity: 0.78 },
  { src: "/entrance/paws/small.svg", left: "44%", top: "68%", size: "4.2rem", rotate: -8, opacity: 0.72 },
  { src: "/entrance/paws/dog.svg", left: "58%", top: "46%", size: "6.8rem", rotate: 22, opacity: 0.84 },
  { src: "/entrance/paws/cat.svg", left: "72%", top: "62%", size: "5rem", rotate: -14, opacity: 0.76 },
  { src: "/entrance/paws/small.svg", left: "84%", top: "40%", size: "3.8rem", rotate: 8, opacity: 0.7 },
  { src: "/entrance/paws/dog.svg", left: "38%", top: "34%", size: "5.8rem", rotate: -26, opacity: 0.8 },
  { src: "/entrance/paws/cat.svg", left: "18%", top: "28%", size: "4.6rem", rotate: 16, opacity: 0.74 },
];

function finishEntrance() {
  document.documentElement.dataset.amcEntrance = "done";
  document.documentElement.classList.remove("amc-entrance-active");
  document.documentElement.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("touch-action");
  window.dispatchEvent(new Event("amc-entrance-done"));
}

function lockPage() {
  document.documentElement.dataset.amcEntrance = "active";
  document.documentElement.classList.add("amc-entrance-active");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
}

export function EntranceExperience({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("black");
  const [sheetUp, setSheetUp] = useState(false);
  const [pawProgress, setPawProgress] = useState(0);
  const [revealOpacity, setRevealOpacity] = useState(1);
  const [promptVisible, setPromptVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const phaseRef = useRef<Phase>("black");
  const pawAccum = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startedRef = useRef(false);
  const sheetStarted = useRef(false);
  const revealStarted = useRef(false);
  const touchY = useRef<number | null>(null);

  const setPhaseSafe = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const complete = useCallback(() => {
    if (phaseRef.current === "done") return;
    setPhaseSafe("done");
    finishEntrance();
  }, [setPhaseSafe]);

  const startReveal = useCallback(() => {
    if (revealStarted.current) return;
    revealStarted.current = true;
    setPhaseSafe("reveal");
    // Unlock the hero at paw completion so type + pets start from frame 0
    // as the entrance fades — not halfway through after the site appears.
    window.dispatchEvent(new Event("amc-intro-complete"));
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 2.4);
      setRevealOpacity(1 - eased);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        complete();
      }
    };
    requestAnimationFrame(tick);
  }, [complete, setPhaseSafe]);

  const startSheet = useCallback(() => {
    if (sheetStarted.current) return;
    sheetStarted.current = true;
    setPhaseSafe("sheet");
    requestAnimationFrame(() => setSheetUp(true));
    window.setTimeout(() => {
      setPhaseSafe("paws");
      setPromptVisible(true);
    }, 1100);
  }, [setPhaseSafe]);

  const startVideo = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setPromptVisible(false);
    setPhaseSafe("playing");
    const video = videoRef.current;
    if (!video) {
      window.setTimeout(startSheet, 400);
      return;
    }
    video.currentTime = 0;
    video.playbackRate = 5.0;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => {
        // If autoplay after gesture still fails, advance so the visit is not stuck.
        window.setTimeout(startSheet, 400);
      });
    }
  }, [setPhaseSafe, startSheet]);

  const onVideoEnded = useCallback(() => {
    setPhaseSafe("hold");
    window.setTimeout(() => startSheet(), 400);
  }, [setPhaseSafe, startSheet]);

  const addPawProgress = useCallback(
    (delta: number) => {
      if (phaseRef.current !== "paws") return;
      pawAccum.current = Math.min(1, Math.max(0, pawAccum.current + delta));
      setPawProgress(pawAccum.current);
      if (pawAccum.current >= 0.98) {
        startReveal();
      }
    },
    [startReveal]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);

    // Already finished this page session (e.g. soft remount) — leave overlay off.
    if (document.documentElement.dataset.amcEntrance === "done") {
      setPhaseSafe("done");
      return () => mq.removeEventListener("change", apply);
    }

    lockPage();

    if (mq.matches) {
      // Simplified path: brief black, white sheet, a few paws, then site.
      setPromptVisible(false);
      setPhaseSafe("sheet");
      requestAnimationFrame(() => setSheetUp(true));
      window.setTimeout(() => {
        setPawProgress(1);
        setPhaseSafe("paws");
        window.setTimeout(() => startReveal(), 700);
      }, 700);
    }

    return () => mq.removeEventListener("change", apply);
  }, [setPhaseSafe, startReveal]);

  useEffect(() => {
    if (phase === "done" || reducedMotion) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const current = phaseRef.current;
      if (current === "black") {
        startVideo();
        return;
      }
      if (current === "paws") {
        const amount = Math.min(0.12, Math.abs(e.deltaY) / 900);
        addPawProgress(amount);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0]?.clientY;
      if (y == null || touchY.current == null) return;
      const dy = touchY.current - y;
      touchY.current = y;
      const current = phaseRef.current;
      if (current === "black" && Math.abs(dy) > 8) {
        startVideo();
        return;
      }
      if (current === "paws" && dy > 0) {
        addPawProgress(Math.min(0.1, dy / 280));
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "PageDown" && e.key !== " ") return;
      e.preventDefault();
      const current = phaseRef.current;
      if (current === "black") {
        startVideo();
        return;
      }
      if (current === "paws") {
        addPawProgress(0.12);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, reducedMotion, startVideo, addPawProgress]);

  const visiblePaws = Math.floor(pawProgress * PAWS.length + 0.001);
  const showOverlay = phase !== "done";

  return (
    <>
      {children}
      {showOverlay ? (
        <div
          className="amc-entrance"
          aria-hidden={phase === "reveal"}
          style={{ opacity: revealOpacity }}
        >
          <div className="amc-entrance__stage">
            {!reducedMotion ? (
              <div className="amc-entrance__video-frame">
                <video
                  ref={videoRef}
                  className="amc-entrance__video"
                  src="/entrance/animal-drawing.mp4"
                  playsInline
                  preload="auto"
                  muted
                  onLoadedMetadata={(e) => {
                    e.currentTarget.playbackRate = 5.0;
                  }}
                  onEnded={onVideoEnded}
                />
              </div>
            ) : null}

            <div
              className={`amc-entrance__sheet ${sheetUp ? "is-up" : ""}`}
              aria-hidden
            >
              {PAWS.map((paw, index) => {
                const shown = index < visiblePaws;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${paw.src}-${index}`}
                    src={paw.src}
                    alt=""
                    className={`amc-entrance__paw ${shown ? "is-visible" : ""}`}
                    style={{
                      left: paw.left,
                      top: paw.top,
                      width: paw.size,
                      transform: `rotate(${paw.rotate}deg)`,
                      opacity: shown ? paw.opacity : 0,
                    }}
                    draggable={false}
                  />
                );
              })}
            </div>

            {promptVisible && (phase === "black" || phase === "paws") ? (
              <p className="amc-entrance__prompt">
                {phase === "black" ? "Scroll to enter" : "Scroll to continue"}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
