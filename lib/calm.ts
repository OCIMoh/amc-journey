export type ChapterId =
  | "hero"
  | "concern"
  | "consultation"
  | "diagnosis"
  | "treatment"
  | "recovery"
  | "services"
  | "close";

/** Scripted baseline calm (0 anxious → 1 calm) and how much live input can override it. */
export const CHAPTER_SIGNAL: Record<
  ChapterId,
  { baseline: number; liveWeight: number }
> = {
  hero: { baseline: 0.1, liveWeight: 0.05 },
  concern: { baseline: 0.06, liveWeight: 0.12 },
  // Reveal beat: live motion finally matters.
  consultation: { baseline: 0.28, liveWeight: 0.72 },
  diagnosis: { baseline: 0.18, liveWeight: 0.55 },
  treatment: { baseline: 0.62, liveWeight: 0.5 },
  recovery: { baseline: 0.9, liveWeight: 0.7 },
  services: { baseline: 0.82, liveWeight: 0.12 },
  close: { baseline: 0.97, liveWeight: 0.04 },
};

export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Map pointer/scroll energy into a live calm reading (fast motion → lower calm). */
export function velocityToLiveCalm(scrollVel: number, pointerVel: number) {
  const energy = Math.min(1, scrollVel * 0.022 + pointerVel * 0.0055);
  return clamp01(1 - energy);
}

export function blendCalm(
  chapter: ChapterId,
  liveCalm: number,
  holdTension = 0
) {
  const { baseline, liveWeight } = CHAPTER_SIGNAL[chapter];
  const blended = lerp(baseline, liveCalm, liveWeight);
  // Hold-to-wait pulls the signal toward anxiety while pressed.
  return clamp01(lerp(blended, 0.02, holdTension));
}

export function calmToLineColor(calm: number) {
  // Soft sage accent → teal (settled)
  const r = Math.round(lerp(140, 47, calm));
  const g = Math.round(lerp(181, 111, calm));
  const b = Math.round(lerp(167, 106, calm));
  return `rgb(${r}, ${g}, ${b})`;
}

export function calmToFontWeight(calm: number) {
  // Heavier when anxious; settles toward a reading weight when calm.
  return Math.round(lerp(750, 400, calm));
}

/** Soft room-tone gain — never alarm-like. */
export function calmToAudioGain(calm: number) {
  return lerp(0.045, 0.012, calm);
}
