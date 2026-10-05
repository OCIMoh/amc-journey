"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { useVitals } from "@/components/VitalsShell";

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, .animal-hit, .magnetic-item";
const MAGNETIC = "a.magnetic-item, button.magnetic-item, .magnetic-item";

/**
 * Desktop dog-paw cursor with soft lag, hover grow, and gentle magnetic pull
 * toward primary clinic buttons. Touch devices keep the normal finger pointer.
 */
export function CalmCursor() {
  const paw = useRef<HTMLDivElement>(null);
  const { reducedMotion, introComplete } = useVitals();

  useEffect(() => {
    if (reducedMotion) return;
    if (!introComplete) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = paw.current;
    if (!el) return;

    document.documentElement.classList.add("has-calm-cursor");
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 1, scale: 1 });

    /* Fluid lag — not locked to the raw mouse point. */
    const xTo = gsap.quickTo(el, "x", {
      duration: 0.42,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 0.42,
      ease: "power3.out",
    });
    const scaleTo = gsap.quickTo(el, "scale", {
      duration: 0.28,
      ease: "power2.out",
    });

    let hovering = false;
    let pressing = false;
    let magnetActive: Element | null = null;
    let raf = 0;
    let mouseX = 0;
    let mouseY = 0;

    const magnetOffset = (target: Element, mx: number, my: number) => {
      const rect = target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy);
      /* Soft pull only inside a short halo — never hard-snaps the click point. */
      const radius = Math.max(rect.width, rect.height) * 0.55 + 56;
      if (dist > radius || dist < 0.01) return { x: mx, y: my, strength: 0 };
      const t = 1 - dist / radius;
      const pull = 0.22 * t * t;
      return {
        x: mx - dx * pull,
        y: my - dy * pull,
        strength: pull,
      };
    };

    const applyHoverLook = () => {
      if (pressing) return;
      if (hovering || magnetActive) {
        scaleTo(1.28);
        el.style.opacity = "0.92";
      } else {
        scaleTo(1);
        el.style.opacity = "1";
      }
    };

    const tick = () => {
      raf = 0;
      let tx = mouseX;
      let ty = mouseY;

      if (magnetActive) {
        const pulled = magnetOffset(magnetActive, mouseX, mouseY);
        tx = pulled.x;
        ty = pulled.y;
      }

      xTo(tx);
      yTo(ty);
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as Element | null;
      hovering = !!target?.closest?.(INTERACTIVE);
      magnetActive = target?.closest?.(MAGNETIC) ?? null;

      /* Near-miss magnetic: if not already over a magnet, check nearby primaries. */
      if (!magnetActive) {
        const magnets = document.querySelectorAll(MAGNETIC);
        let best: Element | null = null;
        let bestDist = Infinity;
        magnets.forEach((node) => {
          const rect = node.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const d = Math.hypot(mouseX - cx, mouseY - cy);
          const reach = Math.max(rect.width, rect.height) * 0.55 + 56;
          if (d < reach && d < bestDist) {
            bestDist = d;
            best = node;
          }
        });
        magnetActive = best;
      }

      applyHoverLook();
      schedule();
    };

    const onDown = () => {
      pressing = true;
      scaleTo(0.88);
      el.style.opacity = "0.85";
    };

    const onUp = () => {
      pressing = false;
      applyHoverLook();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.classList.remove("has-calm-cursor");
    };
  }, [reducedMotion, introComplete]);

  if (reducedMotion) return null;

  return (
    <div
      ref={paw}
      className="amc-paw-cursor pointer-events-none fixed left-0 top-0 z-[72] hidden h-10 w-10 opacity-0 md:block"
      aria-hidden
      style={
        {
          willChange: "transform",
          ["--paw-image"]: "url('/entrance/paws/dog.svg')",
        } as CSSProperties
      }
    >
      <span className="amc-paw-cursor__mark block h-full w-full" />
    </div>
  );
}
