import type { ChapterId } from "@/lib/calm";

export type AnimalId = "dog" | "cat";

export type AnimalState = "idle" | "noticing" | "reacting";

export type SafeZone = {
  /** CSS inset-style anchors — percentages of the viewport */
  right?: string;
  left?: string;
  bottom?: string;
  top?: string;
  /** Width of the animal hit area */
  width: string;
  /** Max width clamp for very large screens */
  maxWidthPx: number;
};

export type AnimalPersonality = {
  id: AnimalId;
  label: string;
  /** Chapters where this animal may appear */
  chapters: ChapterId[];
  /** Desktop placement */
  zoneDesktop: SafeZone;
  /** Tablet / phone placement */
  zoneMobile: SafeZone;
  /** Distance (px) at which the animal starts noticing the paw */
  noticeRadius: number;
  /** How strongly the head turns toward the pointer (degrees) */
  lookStrength: number;
  /** Soft body lean toward the pointer (degrees) */
  leanStrength: number;
  /** Idle breath duration (seconds) */
  breathDuration: number;
  /** How often idle micro-motions fire (seconds between) */
  idleInterval: [number, number];
  /** Click reaction length (seconds) */
  reactionDuration: number;
  /** Delay before noticing settles (seconds) — dog is slower/cautious */
  noticeEase: number;
};

export const ANIMAL_PERSONALITIES: Record<AnimalId, AnimalPersonality> = {
  dog: {
    id: "dog",
    label: "Clinic dog",
    chapters: ["hero", "concern"],
    zoneDesktop: {
      right: "3.5%",
      bottom: "14%",
      width: "min(11.5vw, 168px)",
      maxWidthPx: 168,
    },
    zoneMobile: {
      right: "2%",
      bottom: "10%",
      width: "min(28vw, 112px)",
      maxWidthPx: 112,
    },
    noticeRadius: 160,
    lookStrength: 14,
    leanStrength: 4,
    breathDuration: 3.4,
    idleInterval: [4.2, 7.5],
    reactionDuration: 1.35,
    noticeEase: 0.45,
  },
  cat: {
    id: "cat",
    label: "Clinic cat",
    chapters: ["concern", "consultation"],
    zoneDesktop: {
      right: "5%",
      top: "38%",
      width: "min(10vw, 148px)",
      maxWidthPx: 148,
    },
    zoneMobile: {
      right: "3%",
      bottom: "12%",
      width: "min(26vw, 104px)",
      maxWidthPx: 104,
    },
    noticeRadius: 140,
    lookStrength: 20,
    leanStrength: 6,
    breathDuration: 2.6,
    idleInterval: [2.8, 5.2],
    reactionDuration: 1.05,
    noticeEase: 0.22,
  },
};
