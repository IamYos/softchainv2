"use client";

import { RefObject, useEffect, useState } from "react";

type ScrollSceneProgress = {
  offset: number;
  progress: number;
  viewportHeight: number;
};

export function useScrollSceneProgress(
  sceneRef: RefObject<HTMLElement | null>,
  distance: number,
  disabled = false,
): ScrollSceneProgress {
  const [state, setState] = useState<ScrollSceneProgress>({
    offset: 0,
    progress: 0,
    viewportHeight: typeof window === "undefined" ? 0 : window.innerHeight,
  });

  useEffect(() => {
    if (disabled) {
      return;
    }

    let frameId = 0;

    const update = () => {
      frameId = 0;
      const scene = sceneRef.current;
      const viewportHeight = window.innerHeight;

      if (!scene) {
        setState((current) => {
          if (
            current.offset === 0 &&
            current.progress === 0 &&
            current.viewportHeight === viewportHeight
          ) {
            return current;
          }

          return {
            offset: 0,
            progress: 0,
            viewportHeight,
          };
        });
        return;
      }

      const sceneRect = scene.getBoundingClientRect();
      const clampedDistance = Math.max(distance, 1);
      const offset = Math.min(Math.max(-sceneRect.top, 0), clampedDistance);
      const progress = offset / clampedDistance;

      setState((current) => {
        if (
          Math.abs(current.offset - offset) < 0.5 &&
          Math.abs(current.progress - progress) < 0.001 &&
          current.viewportHeight === viewportHeight
        ) {
          return current;
        }

        return {
          offset,
          progress,
          viewportHeight,
        };
      });
    };

    const schedule = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [disabled, distance, sceneRef]);

  if (disabled) {
    return {
      offset: 0,
      progress: 0,
      viewportHeight:
        state.viewportHeight || (typeof window === "undefined" ? 0 : window.innerHeight),
    };
  }

  return state;
}
