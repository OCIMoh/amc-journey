"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  blendCalm,
  calmToAudioGain,
  calmToFontWeight,
  calmToLineColor,
  type ChapterId,
  clamp01,
  velocityToLiveCalm,
} from "@/lib/calm";

type VitalsContextValue = {
  calm: number;
  chapter: ChapterId;
  awakened: boolean;
  /** True once the entrance paw sequence finishes (hero may start). */
  introComplete: boolean;
  holdTension: number;
  reducedMotion: boolean;
  storyProgress: number;
  setChapter: (id: ChapterId) => void;
  setHoldTension: (n: number) => void;
  setStoryProgress: (n: number) => void;
  awaken: () => void;
  lineColor: string;
  fontWeight: number;
};

const VitalsContext = createContext<VitalsContextValue | null>(null);

export function useVitals() {
  const ctx = useContext(VitalsContext);
  if (!ctx) throw new Error("useVitals must be used inside VitalsShell");
  return ctx;
}

export function VitalsShell({ children }: { children: ReactNode }) {
  const [chapter, setChapter] = useState<ChapterId>("hero");
  const [calm, setCalm] = useState(0.1);
  const [awakened, setAwakened] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [holdTension, setHoldTension] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);

  const scrollVel = useRef(0);
  const pointerVel = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0, t: 0 });
  const holdRef = useRef(0);
  const chapterRef = useRef<ChapterId>("hero");
  const awakenedRef = useRef(false);
  const introCompleteRef = useRef(false);
  const calmSmooth = useRef(0.1);

  useEffect(() => {
    chapterRef.current = chapter;
  }, [chapter]);

  useEffect(() => {
    holdRef.current = holdTension;
  }, [holdTension]);

  const awaken = useCallback(() => {
    if (!introCompleteRef.current) return;
    if (awakenedRef.current) return;
    awakenedRef.current = true;
    setAwakened(true);
  }, []);

  useEffect(() => {
    const markIntroComplete = () => {
      if (introCompleteRef.current) return;
      introCompleteRef.current = true;
      setIntroComplete(true);
    };

    if (
      document.documentElement.dataset.amcEntrance === "done" ||
      document.documentElement.dataset.amcEntrance === "reveal"
    ) {
      markIntroComplete();
    }

    window.addEventListener("amc-intro-complete", markIntroComplete);
    window.addEventListener("amc-entrance-done", markIntroComplete);
    return () => {
      window.removeEventListener("amc-intro-complete", markIntroComplete);
      window.removeEventListener("amc-entrance-done", markIntroComplete);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);

    let lenis: {
      destroy: () => void;
      on: (e: string, cb: (l: { velocity: number }) => void) => void;
      raf: (t: number) => void;
    } | null = null;
    let rafId = 0;
    let killed = false;
    let audioCtx: AudioContext | null = null;
    let gainNode: GainNode | null = null;
    let oscA: OscillatorNode | null = null;
    let oscB: OscillatorNode | null = null;
    let noiseSrc: AudioBufferSourceNode | null = null;
    let audioStarted = false;

    const stopAudio = () => {
      try {
        noiseSrc?.stop();
        oscA?.stop();
        oscB?.stop();
        void audioCtx?.close();
      } catch {
        /* ignore */
      }
      noiseSrc = null;
      oscA = null;
      oscB = null;
      gainNode = null;
      audioCtx = null;
    };

    const startSoftRoomTone = () => {
      if (!introCompleteRef.current) return;
      if (audioStarted || mq.matches) return;
      audioStarted = true;
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        audioCtx = ctx;
        const master = ctx.createGain();
        master.gain.value = 0.02;
        master.connect(ctx.destination);
        gainNode = master;

        // Soft low hum — clinic room, not an alarm.
        const a = ctx.createOscillator();
        a.type = "sine";
        a.frequency.value = 92;
        const aGain = ctx.createGain();
        aGain.gain.value = 0.35;
        a.connect(aGain);
        aGain.connect(master);
        a.start();
        oscA = a;

        const b = ctx.createOscillator();
        b.type = "sine";
        b.frequency.value = 138;
        const bGain = ctx.createGain();
        bGain.gain.value = 0.12;
        b.connect(bGain);
        bGain.connect(master);
        b.start();
        oscB = b;

        // Very soft filtered noise bed.
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.04;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 420;
        const nGain = ctx.createGain();
        nGain.gain.value = 0.4;
        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(master);
        noise.start();
        noiseSrc = noise;
      } catch {
        /* audio optional */
      }
    };

    const waitForEntrance = () =>
      new Promise<void>((resolve) => {
        if (document.documentElement.dataset.amcEntrance === "done") {
          resolve();
          return;
        }
        const onDone = () => {
          window.removeEventListener("amc-entrance-done", onDone);
          resolve();
        };
        window.addEventListener("amc-entrance-done", onDone);
      });

    const boot = async () => {
      if (mq.matches) {
        // Still wait so Lenis does not fight the simplified entrance.
        await waitForEntrance();
        if (killed) return;
        introCompleteRef.current = true;
        setIntroComplete(true);
        setAwakened(true);
        awakenedRef.current = true;
        return;
      }

      await waitForEntrance();
      if (killed) return;

      const [{ default: Lenis }, gsapMod, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      const gsap = gsapMod.default;
      gsap.registerPlugin(ScrollTrigger);
      if (killed) return;

      const instance = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        touchMultiplier: 1.2,
      });
      lenis = instance as unknown as typeof lenis;

      instance.on("scroll", (e: { velocity: number }) => {
        scrollVel.current = Math.abs(e.velocity);
        if (Math.abs(e.velocity) > 0.12) {
          awaken();
          startSoftRoomTone();
        }
        ScrollTrigger.update();
      });

      // One RAF loop drives Lenis; ScrollTrigger reads the updated scroll.
      const loop = (time: number) => {
        if (killed) return;
        instance.raf(time);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);

      // Keep pin distances and scrub math correct when the window changes size.
      let resizeTimer = 0;
      const refreshMotion = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          try {
            (instance as unknown as { resize?: () => void }).resize?.();
          } catch {
            /* optional */
          }
          ScrollTrigger.refresh();
        }, 100);
      };
      window.addEventListener("resize", refreshMotion);
      window.addEventListener("orientationchange", refreshMotion);
      window.visualViewport?.addEventListener("resize", refreshMotion);
      (
        instance as unknown as { __amcCleanup?: () => void }
      ).__amcCleanup = () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", refreshMotion);
        window.removeEventListener("orientationchange", refreshMotion);
        window.visualViewport?.removeEventListener("resize", refreshMotion);
      };
    };

    void boot();

    const onPointer = (ev: PointerEvent) => {
      if (!introCompleteRef.current) return;
      const now = performance.now();
      const dt = Math.max(8, now - (lastPointer.current.t || now));
      const dx = ev.clientX - lastPointer.current.x;
      const dy = ev.clientY - lastPointer.current.y;
      const speed = Math.hypot(dx, dy) / dt;
      pointerVel.current = pointerVel.current * 0.7 + speed * 48 * 0.3;
      lastPointer.current = { x: ev.clientX, y: ev.clientY, t: now };
      if (speed > 0.04) {
        awaken();
        startSoftRoomTone();
      }
    };

    const onWheel = () => {
      if (!introCompleteRef.current) return;
      awaken();
      startSoftRoomTone();
    };
    const onKey = () => {
      if (!introCompleteRef.current) return;
      awaken();
      startSoftRoomTone();
    };
    const onPointerDown = () => {
      if (!introCompleteRef.current) return;
      startSoftRoomTone();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);

    let tickId = 0;
    const tick = () => {
      const live = velocityToLiveCalm(scrollVel.current, pointerVel.current);
      scrollVel.current *= 0.9;
      pointerVel.current *= 0.88;
      const next = blendCalm(chapterRef.current, live, holdRef.current);
      calmSmooth.current += (next - calmSmooth.current) * 0.14;
      const smoothed = clamp01(calmSmooth.current);
      setCalm(smoothed);
      document.documentElement.style.setProperty("--calm", String(smoothed));
      document.documentElement.style.setProperty(
        "--line-color",
        calmToLineColor(smoothed)
      );
      document.documentElement.style.setProperty(
        "--headline-weight",
        String(calmToFontWeight(smoothed))
      );
      if (gainNode && audioCtx) {
        const target = calmToAudioGain(smoothed);
        gainNode.gain.setTargetAtTime(target, audioCtx.currentTime, 0.35);
      }
      tickId = requestAnimationFrame(tick);
    };
    tickId = requestAnimationFrame(tick);

    return () => {
      killed = true;
      mq.removeEventListener("change", apply);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(tickId);
      try {
        (lenis as unknown as { __amcCleanup?: () => void } | null)?.__amcCleanup?.();
      } catch {
        /* ignore */
      }
      lenis?.destroy();
      stopAudio();
    };
  }, [awaken]);

  const value = useMemo<VitalsContextValue>(
    () => ({
      calm,
      chapter,
      awakened,
      introComplete,
      holdTension,
      reducedMotion,
      storyProgress,
      setChapter,
      setHoldTension,
      setStoryProgress,
      awaken,
      lineColor: calmToLineColor(calm),
      fontWeight: calmToFontWeight(calm),
    }),
    [
      calm,
      chapter,
      awakened,
      introComplete,
      holdTension,
      reducedMotion,
      storyProgress,
      awaken,
    ]
  );

  return (
    <VitalsContext.Provider value={value}>
      <div
        className={`vitals-root ${awakened ? "is-awake" : "is-waiting"} ${
          introComplete ? "is-intro-ready" : "is-intro-locked"
        } ${reducedMotion ? "is-reduced" : ""}`}
        style={
          {
            "--calm": calm,
            "--line-color": calmToLineColor(calm),
            "--headline-weight": calmToFontWeight(calm),
          } as CSSProperties
        }
      >
        {children}
      </div>
    </VitalsContext.Provider>
  );
}
