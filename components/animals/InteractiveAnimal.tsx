"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import gsap from "gsap";
import type { AnimalPersonality, AnimalState } from "./types";

type InteractiveAnimalProps = {
  personality: AnimalPersonality;
  art: ReactNode;
  active: boolean;
  reducedMotion: boolean;
  isCoarsePointer: boolean;
  zone: AnimalPersonality["zoneDesktop"];
};

function zoneStyle(zone: AnimalPersonality["zoneDesktop"]): CSSProperties {
  return {
    position: "fixed",
    right: zone.right,
    left: zone.left,
    top: zone.top,
    bottom: zone.bottom,
    width: zone.width,
    maxWidth: zone.maxWidthPx,
    zIndex: 42,
  };
}

/**
 * One clinic animal with idle / notice / click states.
 * Does not permanently follow the cursor — only reacts nearby.
 */
export function InteractiveAnimal({
  personality,
  art,
  active,
  reducedMotion,
  isCoarsePointer,
  zone,
}: InteractiveAnimalProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<AnimalState>("idle");
  const stateRef = useRef<AnimalState>("idle");
  const pointer = useRef({ x: -9999, y: -9999 });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setAnimalState = useCallback((next: AnimalState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  /* Spawn / despawn opacity */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    if (active) {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reducedMotion ? 0.2 : 0.7,
          ease: "power2.out",
        }
      );
    } else {
      gsap.to(el, {
        autoAlpha: 0,
        y: 8,
        duration: reducedMotion ? 0.15 : 0.45,
        ease: "power2.in",
      });
    }
  }, [active, reducedMotion]);

  /* Idle breath + occasional micro motion */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !active || reducedMotion) return;

    const body = el.querySelector(".animal-body");
    const earL = el.querySelector(".animal-ear-l");
    const earR = el.querySelector(".animal-ear-r");
    const tail = el.querySelector(".animal-tail");

    const breath = gsap.to(body, {
      scale: 1.02,
      duration: personality.breathDuration,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      transformOrigin: "50% 80%",
    });

    const scheduleIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      const [min, max] = personality.idleInterval;
      const wait = (min + Math.random() * (max - min)) * 1000;
      idleTimer.current = setTimeout(() => {
        if (stateRef.current !== "idle" || !rootRef.current) {
          scheduleIdle();
          return;
        }
        if (personality.id === "dog") {
          gsap
            .timeline()
            .to(earL, { rotation: -8, duration: 0.18, ease: "power2.out" }, 0)
            .to(earR, { rotation: 6, duration: 0.18, ease: "power2.out" }, 0.04)
            .to(earL, { rotation: 0, duration: 0.35, ease: "power2.inOut" }, 0.28)
            .to(earR, { rotation: 0, duration: 0.35, ease: "power2.inOut" }, 0.3)
            .to(
              tail,
              { rotation: 8, duration: 0.28, ease: "sine.out", yoyo: true, repeat: 1 },
              0
            );
        } else {
          gsap
            .timeline()
            .to(tail, { rotation: -18, duration: 0.22, ease: "power2.out" }, 0)
            .to(tail, { rotation: 12, duration: 0.28, ease: "power2.inOut" }, 0.22)
            .to(tail, { rotation: 0, duration: 0.35, ease: "power2.inOut" }, 0.5)
            .to(earL, { rotation: -6, duration: 0.15, yoyo: true, repeat: 1 }, 0.1)
            .to(earR, { rotation: 6, duration: 0.15, yoyo: true, repeat: 1 }, 0.12);
        }
        scheduleIdle();
      }, wait);
    };

    scheduleIdle();

    return () => {
      breath.kill();
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [active, reducedMotion, personality]);

  /* Proximity notice — desktop only; never permanently follow */
  useEffect(() => {
    if (!active || reducedMotion || isCoarsePointer) return;
    const el = rootRef.current;
    if (!el) return;

    const head = el.querySelector(".animal-head");
    const body = el.querySelector(".animal-body");
    const leg = el.querySelector(".animal-leg-front");

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      if (stateRef.current === "reacting") return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.55;
      const cy = rect.top + rect.height * 0.45;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < personality.noticeRadius) {
        if (stateRef.current === "idle") setAnimalState("noticing");
        const nx = Math.max(-1, Math.min(1, dx / personality.noticeRadius));
        const ny = Math.max(-1, Math.min(1, dy / personality.noticeRadius));
        gsap.to(head, {
          rotation: nx * personality.lookStrength,
          y: ny * 3,
          duration: personality.noticeEase,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(body, {
          rotation: nx * personality.leanStrength,
          duration: personality.noticeEase + 0.1,
          ease: "power2.out",
          overwrite: "auto",
        });
        if (personality.id === "cat" && dist < personality.noticeRadius * 0.55) {
          gsap.to(leg, {
            x: nx * 3,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      } else if (stateRef.current === "noticing") {
        setAnimalState("idle");
        gsap.to(head, { rotation: 0, y: 0, duration: 0.55, ease: "power2.out" });
        gsap.to(body, { rotation: 0, duration: 0.6, ease: "power2.out" });
        gsap.to(leg, { x: 0, duration: 0.4, ease: "power2.out" });
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [
    active,
    reducedMotion,
    isCoarsePointer,
    personality,
    setAnimalState,
  ]);

  const playReaction = useCallback(() => {
    const el = rootRef.current;
    if (!el || !active || stateRef.current === "reacting") return;

    setAnimalState("reacting");
    const head = el.querySelector(".animal-head");
    const body = el.querySelector(".animal-body");
    const earL = el.querySelector(".animal-ear-l");
    const earR = el.querySelector(".animal-ear-r");
    const tail = el.querySelector(".animal-tail");
    const leg = el.querySelector(".animal-leg-front");

    if (reducedMotion) {
      gsap
        .timeline({
          onComplete: () => {
            setAnimalState("idle");
          },
        })
        .to(el, { scale: 1.04, duration: 0.15, yoyo: true, repeat: 1 });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to([head, body, earL, earR, tail, leg], {
          rotation: 0,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
        setAnimalState("idle");
      },
    });

    if (personality.id === "dog") {
      tl.to(body, { y: -6, duration: 0.18, ease: "power2.out" }, 0)
        .to(body, { y: 0, duration: 0.28, ease: "power2.in" }, 0.18)
        .to(tail, { rotation: 22, duration: 0.12, yoyo: true, repeat: 5 }, 0)
        .to(earL, { rotation: -12, duration: 0.15, yoyo: true, repeat: 3 }, 0.05)
        .to(earR, { rotation: 10, duration: 0.15, yoyo: true, repeat: 3 }, 0.08)
        .to(head, { rotation: 8, duration: 0.2, yoyo: true, repeat: 1 }, 0.1)
        .to(leg, { y: -4, duration: 0.16, yoyo: true, repeat: 1 }, 0.12);
    } else {
      tl.to(body, { y: -4, rotation: -3, duration: 0.14, ease: "power2.out" }, 0)
        .to(body, { y: 0, rotation: 3, duration: 0.16, ease: "power1.inOut" }, 0.14)
        .to(body, { rotation: 0, duration: 0.2, ease: "power2.out" }, 0.3)
        .to(tail, { rotation: -28, duration: 0.1, yoyo: true, repeat: 6 }, 0)
        .to(head, { rotation: -10, y: -2, duration: 0.18, yoyo: true, repeat: 1 }, 0)
        .to(earL, { rotation: -14, duration: 0.12, yoyo: true, repeat: 2 }, 0.05)
        .to(earR, { rotation: 14, duration: 0.12, yoyo: true, repeat: 2 }, 0.07)
        .to(leg, { x: 5, duration: 0.14, yoyo: true, repeat: 1 }, 0.1);
    }
  }, [active, personality.id, reducedMotion, setAnimalState]);

  return (
    <button
      ref={rootRef}
      type="button"
      aria-label={`${personality.label}. ${
        isCoarsePointer ? "Tap" : "Click"
      } for a playful reaction.`}
      className="animal-hit group border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-teal/60"
      style={{
        ...zoneStyle(zone),
        opacity: 0,
        visibility: "hidden",
        pointerEvents: active ? "auto" : "none",
        touchAction: "manipulation",
        cursor: isCoarsePointer ? "pointer" : "none",
      }}
      tabIndex={active ? 0 : -1}
      data-animal={personality.id}
      data-animal-state={state}
      onClick={(e) => {
        e.preventDefault();
        playReaction();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          playReaction();
        }
      }}
    >
      <span className="block w-full drop-shadow-[0_10px_24px_rgba(22,28,27,0.28)] transition-[filter] duration-300 group-hover:brightness-110">
        {art}
      </span>
    </button>
  );
}
