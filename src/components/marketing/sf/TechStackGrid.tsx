"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/usePrefersReducedMotion";
import styles from "./SFPostFrame.module.css";
import { TECH_ICONS } from "./techStackIconData";

/**
 * Deterministic shuffle so SSR and client produce identical output.
 */
function shuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const SHUFFLED = shuffle(TECH_ICONS, 42);

function createSlots(slotCount: number) {
  return Array.from({ length: slotCount }, (_, index) => ({
    iconIndex: index % SHUFFLED.length,
    version: index,
  }));
}

function SwitchingGrid({
  slotCount,
  prefersReducedMotion,
}: {
  slotCount: number;
  prefersReducedMotion: boolean;
}) {
  const [slots, setSlots] = useState(() => createSlots(slotCount));
  const nextIconIndexRef = useRef(slotCount);
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
          let nextIconIndex = nextIconIndexRef.current % SHUFFLED.length;

          if (current[targetSlot].iconIndex === nextIconIndex) {
            nextIconIndex = (nextIconIndex + 1) % SHUFFLED.length;
          }

          const nextSlots = [...current];
          nextSlots[targetSlot] = {
            iconIndex: nextIconIndex,
            version: current[targetSlot].version + 1,
          };

          return nextSlots;
        });

        slotCursorRef.current += 1;
        nextIconIndexRef.current += 1;

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
        const icon = SHUFFLED[slot.iconIndex];
        const style = {
          ["--tech-slot-delay" as string]: `${(index % 5) * 0.14}s`,
          ["--tech-slot-duration" as string]: `${3.1 + (index % 4) * 0.38}s`,
        } as CSSProperties;

        return (
          <div
            key={`${index}-${slot.version}`}
            className={styles.techSignalSlot}
            style={style}
            title={icon.t}
          >
            <svg
              className={styles.techIconGlyph}
              role="img"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={icon.p} />
            </svg>
          </div>
        );
      })}
    </>
  );
}

export function TechStackGrid() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [slotCount, setSlotCount] = useState(20);

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

  return (
    <div className={styles.techStackGrid} aria-label="Technologies we work with">
      <div className={styles.techPixelMatrix}>
        <SwitchingGrid
          key={slotCount}
          slotCount={slotCount}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </div>
  );
}
