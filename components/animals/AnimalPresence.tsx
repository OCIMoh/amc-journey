"use client";

import { useEffect, useMemo, useState } from "react";
import { useVitals } from "@/components/VitalsShell";
import { InteractiveAnimal } from "./InteractiveAnimal";
import { DogArt } from "./art/DogArt";
import { CatArt } from "./art/CatArt";
import { ANIMAL_PERSONALITIES, type AnimalId } from "./types";
import type { ChapterId } from "@/lib/calm";

function chapterAllows(id: AnimalId, chapter: ChapterId) {
  return ANIMAL_PERSONALITIES[id].chapters.includes(chapter);
}

/**
 * Section-aware clinic animals. No switcher UI —
 * visibility follows the story chapter and viewport.
 */
export function AnimalPresence() {
  const { chapter, introComplete, reducedMotion } = useVitals();
  const [isCoarse, setIsCoarse] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const narrow = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setIsCoarse(coarse.matches);
      setIsNarrow(narrow.matches);
    };
    apply();
    coarse.addEventListener("change", apply);
    narrow.addEventListener("change", apply);
    return () => {
      coarse.removeEventListener("change", apply);
      narrow.removeEventListener("change", apply);
    };
  }, []);

  const active = useMemo(() => {
    if (!introComplete) {
      return { dog: false, cat: false };
    }

    const dogOk = chapterAllows("dog", chapter);
    const catOk = chapterAllows("cat", chapter);

    /* Phones: only one animal so the layout stays clear. */
    if (isNarrow || isCoarse) {
      if (chapter === "hero" || chapter === "concern") {
        return { dog: dogOk, cat: false };
      }
      if (chapter === "consultation") {
        return { dog: false, cat: catOk };
      }
      return { dog: false, cat: false };
    }

    /* Desktop: both may share early story if their chapters overlap. */
    return { dog: dogOk, cat: catOk };
  }, [chapter, introComplete, isNarrow, isCoarse]);

  const dog = ANIMAL_PERSONALITIES.dog;
  const cat = ANIMAL_PERSONALITIES.cat;

  return (
    <>
      <InteractiveAnimal
        personality={dog}
        art={<DogArt className="h-auto w-full" />}
        active={active.dog}
        reducedMotion={reducedMotion}
        isCoarsePointer={isCoarse}
        zone={isNarrow ? dog.zoneMobile : dog.zoneDesktop}
      />
      <InteractiveAnimal
        personality={cat}
        art={<CatArt className="h-auto w-full" />}
        active={active.cat}
        reducedMotion={reducedMotion}
        isCoarsePointer={isCoarse}
        zone={isNarrow ? cat.zoneMobile : cat.zoneDesktop}
      />
    </>
  );
}
