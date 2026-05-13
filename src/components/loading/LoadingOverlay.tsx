"use client";

import { ScrambleHeadlineLoop } from "@/components/marketing/ScrambleHeadlineLoop";
import styles from "./LoadingOverlay.module.css";

export function LoadingOverlay({ label = "LOADING" }: { label?: string }) {
  return (
    <div
      className={styles.overlay}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <svg
        className={styles.square}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="1.5"
          y="1.5"
          width="21"
          height="21"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect x="1.5" y="22.5" width="21" height="0" fill="currentColor">
          <animate
            attributeName="height"
            values="0;21;0"
            keyTimes="0;0.55;1"
            dur="1.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.2 1; 0.45 0 0.2 1"
          />
          <animate
            attributeName="y"
            values="22.5;1.5;22.5"
            keyTimes="0;0.55;1"
            dur="1.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.2 1; 0.45 0 0.2 1"
          />
        </rect>
      </svg>

      <ScrambleHeadlineLoop
        lineSets={[[label]]}
        intervalMs={2400}
        resolvedColor="var(--mf-text-body)"
        scrambleColors={["#ff5841", "#b9b9b9"]}
        className={styles.scrambleContainer}
        lineClassName={styles.scrambleLine}
        letterSpacing="0.32em"
      />
    </div>
  );
}
