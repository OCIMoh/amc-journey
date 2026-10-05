"use client";

import { useEffect, useRef } from "react";
import { useVitals } from "@/components/VitalsShell";

/** Canvas ECG driven by shared calmValue — live signal, not a decorative loop. */
export function EcgLine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { calm, awakened, reducedMotion, lineColor } = useVitals();
  const calmRef = useRef(calm);
  const awakeRef = useRef(awakened);
  const colorRef = useRef(lineColor);

  useEffect(() => {
    calmRef.current = calm;
  }, [calm]);
  useEffect(() => {
    awakeRef.current = awakened;
  }, [awakened]);
  useEffect(() => {
    colorRef.current = lineColor;
  }, [lineColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let phase = 0;
    let killed = false;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = 64;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (killed) return;
      const w = window.innerWidth;
      const h = 64;
      const c = calmRef.current;
      const anxious = 1 - c;

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(22,28,27,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.62);
      ctx.lineTo(w, h * 0.62);
      ctx.stroke();

      const amp = 5 + anxious * 26;
      const noise = anxious * 5.2;
      const speed = reducedMotion
        ? 0
        : awakeRef.current
          ? 0.028 + anxious * 0.11
          : 0.003;
      phase += speed;

      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = 1.5 + c * 0.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();

      const mid = h * 0.62;
      const beats = 2.6 + anxious * 3.2;

      for (let x = 0; x <= w; x += 2) {
        const t = (x / w) * beats * Math.PI * 2 + phase;
        const cycle = ((t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let y = 0;
        if (cycle < 0.35) {
          y = Math.sin(cycle * 4) * 0.25;
        } else if (cycle < 0.55) {
          y = 0;
        } else if (cycle < 0.7) {
          y = -Math.sin((cycle - 0.55) * 18) * 0.35;
        } else if (cycle < 0.9) {
          y = Math.sin((cycle - 0.7) * 14) * 1.15;
        } else if (cycle < 1.15) {
          y = -Math.sin((cycle - 0.9) * 10) * 0.45;
        } else if (cycle < 1.8) {
          y = Math.sin((cycle - 1.15) * 3) * 0.35;
        } else {
          y = 0;
        }

        const jitter =
          reducedMotion || !awakeRef.current
            ? 0
            : (Math.sin(x * 0.37 + phase * 3) +
                Math.sin(x * 0.11 - phase * 2)) *
              noise *
              0.4;

        const py = mid - y * amp - jitter;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();

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
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] pt-14 md:pt-16"
      aria-hidden
    >
      <canvas ref={canvasRef} className="block w-full opacity-90" />
    </div>
  );
}
