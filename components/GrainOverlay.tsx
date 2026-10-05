"use client";

import { useEffect, useRef } from "react";
import { useVitals } from "@/components/VitalsShell";
import type { ChapterId } from "@/lib/calm";

/** Soften / hide grain on the opening hero and story chapters (sections 1–2). */
const EARLY_CHAPTERS = new Set<ChapterId>([
  "hero",
  "concern",
  "consultation",
  "diagnosis",
  "treatment",
  "recovery",
  "close",
]);

/**
 * Visual film grain — fixed canvas overlay keyed to calm.
 * Hidden during the entrance. Near-zero on sections 1–2; very subtle later.
 * Does not touch ambient audio.
 */
export function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { calm, reducedMotion, chapter, introComplete } = useVitals();
  const calmRef = useRef(calm);
  const chapterRef = useRef(chapter);
  const introRef = useRef(introComplete);

  useEffect(() => {
    calmRef.current = calm;
  }, [calm]);

  useEffect(() => {
    chapterRef.current = chapter;
  }, [chapter]);

  useEffect(() => {
    introRef.current = introComplete;
  }, [introComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let killed = false;
    let frame = 0;

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth / 3);
      canvas.height = Math.floor(window.innerHeight / 3);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (killed) return;
      frame += 1;
      // Update grain every 4th frame — enough shimmer, less GPU cost.
      if (frame % 4 === 0) {
        const entranceActive =
          document.documentElement.classList.contains("amc-entrance-active") ||
          !introRef.current;

        if (entranceActive) {
          canvas.style.opacity = "0";
          canvas.style.visibility = "hidden";
        } else {
          canvas.style.visibility = "visible";
          const anxious = 1 - calmRef.current;
          // Was ~0.09 at peak anxiety — too obvious on the open + story.
          // Early sections: effectively off. Later sections: very light texture.
          const early = EARLY_CHAPTERS.has(chapterRef.current);
          const base = early
            ? 0
            : reducedMotion
              ? anxious * 0.018
              : anxious * 0.032;
          canvas.style.opacity = String(base);

          if (base > 0.002) {
            const w = canvas.width;
            const h = canvas.height;
            const image = ctx.createImageData(w, h);
            const data = image.data;
            for (let i = 0; i < data.length; i += 4) {
              const n = (Math.random() * 255) | 0;
              data[i] = n;
              data[i + 1] = n;
              data[i + 2] = n;
              data[i + 3] = 255;
            }
            ctx.putImageData(image, 0, 0);
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      killed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[55] h-full w-full mix-blend-overlay"
      aria-hidden
    />
  );
}
