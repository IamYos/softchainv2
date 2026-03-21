"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/usePrefersReducedMotion";
import gridStyles from "@/components/marketing/sf/SFPostFrame.module.css";
import styles from "./AboutPixelGrid.module.css";

type PixelValue = 0 | 1 | 2 | 3;

type PixelPattern = {
  cells: PixelValue[];
  label: string;
};

function pattern(label: string, rows: string[]): PixelPattern {
  return {
    label,
    cells: rows.join("").split("").map((value) => Number(value) as PixelValue),
  };
}

const PIXEL_PATTERNS: PixelPattern[] = [
  pattern("Diamond", ["00100", "01110", "01210", "01110", "00300"]),
  pattern("Frame", ["11111", "10001", "10201", "10001", "11111"]),
  pattern("Pulse", ["01010", "11011", "00200", "11011", "01010"]),
  pattern("Cross", ["10001", "01010", "00300", "01010", "10001"]),
  pattern("Orbit", ["01110", "10001", "10301", "10001", "01110"]),
  pattern("Bars", ["10000", "11000", "11300", "11110", "11111"]),
  pattern("Arrow", ["00100", "00110", "11311", "00110", "00100"]),
  pattern("Split", ["10101", "01010", "10301", "01010", "10101"]),
  pattern("Wave", ["10010", "01001", "00300", "10010", "01001"]),
  pattern("Node", ["00100", "01110", "11011", "01110", "00100"]),
];

function shuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let currentSeed = seed;

  for (let index = result.length - 1; index > 0; index -= 1) {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    const targetIndex = currentSeed % (index + 1);
    [result[index], result[targetIndex]] = [result[targetIndex], result[index]];
  }

  return result;
}

const SHUFFLED_PATTERNS = shuffle(PIXEL_PATTERNS, 42);

function createSlots(slotCount: number) {
  return Array.from({ length: slotCount }, (_, index) => ({
    patternIndex: index % SHUFFLED_PATTERNS.length,
    version: index,
  }));
}

function getPixelClass(value: PixelValue) {
  switch (value) {
    case 1:
      return styles.pixelCellGray;
    case 2:
      return styles.pixelCellOrange;
    case 3:
      return styles.pixelCellGreen;
    default:
      return styles.pixelCellOff;
  }
}

function SwitchingGrid({
  prefersReducedMotion,
  slotCount,
}: {
  prefersReducedMotion: boolean;
  slotCount: number;
}) {
  const [slots, setSlots] = useState(() => createSlots(slotCount));
  const nextPatternIndexRef = useRef(slotCount);
  const slotCursorRef = useRef(0);
  const slotOrderRef = useRef(
    shuffle(
      Array.from({ length: slotCount }, (_, index) => index),
      17 + slotCount,
    ),
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let timeoutId = 0;

    const queueTick = () => {
      const delay = 360 + (slotCursorRef.current % 6) * 78;

      timeoutId = window.setTimeout(() => {
        setSlots((current) => {
          const targetSlot = slotOrderRef.current[slotCursorRef.current % slotCount];
          let nextPatternIndex = nextPatternIndexRef.current % SHUFFLED_PATTERNS.length;

          if (current[targetSlot].patternIndex === nextPatternIndex) {
            nextPatternIndex = (nextPatternIndex + 1) % SHUFFLED_PATTERNS.length;
          }

          const nextSlots = [...current];
          nextSlots[targetSlot] = {
            patternIndex: nextPatternIndex,
            version: current[targetSlot].version + 1,
          };

          return nextSlots;
        });

        slotCursorRef.current += 1;
        nextPatternIndexRef.current += 1;

        if (slotCursorRef.current % slotCount === 0) {
          slotOrderRef.current = shuffle(slotOrderRef.current, slotCursorRef.current + 23);
        }

        queueTick();
      }, delay);
    };

    queueTick();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion, slotCount]);

  return (
    <>
      {slots.map((slot, index) => {
        const activePattern = SHUFFLED_PATTERNS[slot.patternIndex];
        const style = {
          ["--tech-slot-delay" as string]: `${(index % 5) * 0.14}s`,
          ["--tech-slot-duration" as string]: `${3.1 + (index % 4) * 0.38}s`,
        } as CSSProperties;

        return (
          <div
            key={`${index}-${slot.version}`}
            className={gridStyles.techSignalSlot}
            style={style}
            title={activePattern.label}
          >
            <div className={styles.pixelGlyph} aria-hidden="true">
              {activePattern.cells.map((value, cellIndex) => (
                <span
                  key={`${activePattern.label}-${cellIndex}`}
                  className={`${styles.pixelCell} ${getPixelClass(value)}`}
                  style={
                    {
                      ["--pixel-cell-delay" as string]: `${(cellIndex % 5) * 0.04}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function AboutPixelGrid() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [slotCount, setSlotCount] = useState(20);
  const pixelMatrixRef = useRef<HTMLDivElement | null>(null);
  const activeSlotRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frameId = 0;

    const updateSlotCount = () => {
      setSlotCount(window.innerWidth >= 1025 ? 24 : 20);
    };

    frameId = window.requestAnimationFrame(updateSlotCount);
    window.addEventListener("resize", updateSlotCount);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("resize", updateSlotCount);
    };
  }, []);

  useEffect(() => {
    const pixelMatrix = pixelMatrixRef.current;
    if (!pixelMatrix || prefersReducedMotion) {
      return;
    }

    const clearActiveSlot = () => {
      const activeSlot = activeSlotRef.current;
      if (!activeSlot) {
        return;
      }

      activeSlot.classList.remove(gridStyles.techSignalSlotActive);
      activeSlot.classList.remove(gridStyles.techSignalSlotPressed);
      activeSlotRef.current = null;
    };

    const activateSlot = (slot: HTMLElement) => {
      if (activeSlotRef.current && activeSlotRef.current !== slot) {
        clearActiveSlot();
      }

      activeSlotRef.current = slot;
      slot.classList.add(gridStyles.techSignalSlotActive);
      slot.classList.remove(gridStyles.techSignalSlotPressed);
      void slot.offsetWidth;
      slot.classList.add(gridStyles.techSignalSlotPressed);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const slot = target.closest<HTMLElement>(`.${gridStyles.techSignalSlot}`);
      if (!slot || !pixelMatrix.contains(slot)) {
        return;
      }

      activateSlot(slot);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        clearActiveSlot();
        return;
      }

      const slot = target.closest(`.${gridStyles.techSignalSlot}`);
      if (slot && pixelMatrix.contains(slot)) {
        return;
      }

      clearActiveSlot();
    };

    const handleAnimationEnd = (event: AnimationEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.classList.contains(gridStyles.techSignalSlotPressed)) {
        target.classList.remove(gridStyles.techSignalSlotPressed);
      }
    };

    pixelMatrix.addEventListener("click", handleClick);
    pixelMatrix.addEventListener("animationend", handleAnimationEnd);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      pixelMatrix.removeEventListener("click", handleClick);
      pixelMatrix.removeEventListener("animationend", handleAnimationEnd);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [prefersReducedMotion]);

  return (
    <div className={gridStyles.techStackGrid} aria-label="Animated signal grid">
      <div ref={pixelMatrixRef} className={gridStyles.techPixelMatrix}>
        <SwitchingGrid key={slotCount} prefersReducedMotion={prefersReducedMotion} slotCount={slotCount} />
      </div>
    </div>
  );
}
