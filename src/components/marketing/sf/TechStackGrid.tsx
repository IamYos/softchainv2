"use client";

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

const ROW_COUNT = 7;
const SHUFFLED = shuffle(TECH_ICONS, 42);
const ICON_ROWS = Array.from({ length: ROW_COUNT }, (_, i) => {
  const perRow = Math.ceil(SHUFFLED.length / ROW_COUNT);
  return SHUFFLED.slice(i * perRow, (i + 1) * perRow);
});

function MarqueeRow({
  icons,
  reverse,
  duration,
}: {
  icons: typeof TECH_ICONS;
  reverse?: boolean;
  duration: number;
}) {
  const doubled = [...icons, ...icons];

  return (
    <div className={styles.techMarqueeRow}>
      <div
        className={`${styles.techMarqueeTrack} ${reverse ? styles.techMarqueeReverse : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((icon, i) => (
          <div key={`${icon.t}-${i}`} className={styles.techIcon} title={icon.t}>
            <svg
              role="img"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={icon.p} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechStackGrid() {
  const durations = [40, 48, 34, 52, 38, 46, 42];

  return (
    <div className={styles.techStackGrid} aria-label="Technologies we work with">
      {ICON_ROWS.map((rowIcons, i) => (
        <MarqueeRow
          key={i}
          icons={rowIcons}
          reverse={i % 2 === 1}
          duration={durations[i]}
        />
      ))}
    </div>
  );
}
