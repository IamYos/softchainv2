"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/usePrefersReducedMotion";
import { useScrollSceneProgress } from "@/components/marketing/useScrollSceneProgress";
import styles from "./SFPostFrame.module.css";
import {
  SFArrowLeftIcon,
  SFArrowRightIcon,
  SFDefaultIcon,
  SFGlobeIcon,
  SFTriangleIcon,
} from "./SFSourceIcons";

const SOLUTIONS = [
  {
    title: "Software Design & Engineering",
    description:
      "Custom software, internal systems, client platforms, ERP and workflow integrations, and native mobile delivery designed and built for real operational load.",
    href: "#sf-solutions",
    icon: "globe" as const,
    lines: 3,
  },
  {
    title: "AI Systems",
    description:
      "RAG, workflow automation, intelligent interfaces, and private or hybrid inference pipelines deployed where they create measurable business value.",
    href: "#sf-insights",
    icon: "dots" as const,
    lines: 3,
  },
  {
    title: "IT Infrastructure",
    description:
      "Cloud, on-premise, and hybrid environments handled end to end, including networking, security posture, migrations, observability, and long-term operational stability.",
    href: "#closing-cta",
    icon: "default" as const,
    lines: 4,
  },
  {
    title: "Technology Management",
    description:
      "Technology leadership across procurement, digitization, vendor coordination, planning, and ongoing operational oversight when the business needs a hands-on partner.",
    href: "#closing-cta",
    icon: "triangle" as const,
    lines: 0,
  },
] as const;

type SolutionsSceneLayout = {
  cardOffsets: number[];
  sceneDistance: number;
  travelPx: number;
};

function areOffsetsEqual(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => Math.abs(value - right[index]) < 0.5);
}

function SolutionLines({ count }: { count: number }) {
  if (count === 0) {
    return null;
  }

  return (
    <div className={styles.solutionLines} aria-hidden="true">
      <span className={`${styles.solutionLine} ${styles.solutionLineTop}`} />
      <span className={`${styles.solutionLine} ${styles.solutionLineBottom}`} />
      <span className={`${styles.solutionLine} ${styles.solutionLineLeft}`} />
      {count === 4 ? (
        <span className={`${styles.solutionLine} ${styles.solutionLineRight}`} />
      ) : null}
    </div>
  );
}

function SolutionIcon({ icon }: { icon: (typeof SOLUTIONS)[number]["icon"] }) {
  if (icon === "globe") {
    return <SFGlobeIcon className={styles.solutionIconShell} />;
  }

  if (icon === "default") {
    return <SFDefaultIcon className={styles.solutionIconShell} />;
  }

  if (icon === "triangle") {
    return <SFTriangleIcon className={styles.solutionIconShell} />;
  }

  return <div className={styles.solutionDotsIcon} aria-hidden="true" />;
}

export function SFSolutionSlider() {
  const sceneRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [layout, setLayout] = useState<SolutionsSceneLayout>({
    cardOffsets: SOLUTIONS.map(() => 0),
    sceneDistance: 0,
    travelPx: 0,
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;

    const measure = () => {
      frameId = 0;

      const viewport = viewportRef.current;
      const track = trackRef.current;

      if (!viewport || !track) {
        return;
      }

      const travelPx = Math.max(track.scrollWidth - viewport.clientWidth, 0);
      const sceneDistance = Math.max(travelPx, window.innerHeight * 0.75);
      const cardOffsets = Array.from(track.children).map((child) =>
        Math.min((child as HTMLElement).offsetLeft, travelPx),
      );

      setLayout((current) => {
        if (
          Math.abs(current.travelPx - travelPx) < 0.5 &&
          Math.abs(current.sceneDistance - sceneDistance) < 0.5 &&
          areOffsetsEqual(current.cardOffsets, cardOffsets)
        ) {
          return current;
        }

        return {
          cardOffsets,
          sceneDistance,
          travelPx,
        };
      });
    };

    const scheduleMeasure = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(measure);
      }
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleMeasure);

      if (viewportRef.current) {
        resizeObserver.observe(viewportRef.current);
      }

      if (trackRef.current) {
        resizeObserver.observe(trackRef.current);
      }

      Array.from(trackRef.current?.children ?? []).forEach((child) => {
        resizeObserver?.observe(child);
      });
    }

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [prefersReducedMotion]);

  const { progress } = useScrollSceneProgress(
    sceneRef,
    layout.sceneDistance,
    prefersReducedMotion,
  );
  const currentTravel = prefersReducedMotion ? 0 : layout.travelPx * progress;
  const hasPreviousCard = !prefersReducedMotion && currentTravel > 8;
  const hasNextCard = !prefersReducedMotion && currentTravel < layout.travelPx - 8;
  const sceneStyle = prefersReducedMotion
    ? undefined
    : { height: `calc(100svh + ${Math.round(layout.sceneDistance)}px)` };
  const stageClassName = prefersReducedMotion
    ? `${styles.solutionsStage} ${styles.solutionsStageReduced}`
    : styles.solutionsStage;
  const viewportClassName = prefersReducedMotion
    ? `${styles.solutionsViewport} ${styles.solutionsViewportReduced}`
    : styles.solutionsViewport;
  const trackClassName = prefersReducedMotion
    ? `${styles.solutionsTrack} ${styles.solutionsTrackReduced}`
    : styles.solutionsTrack;

  const scrollToCardOffset = (targetOffset: number) => {
    if (prefersReducedMotion) {
      return;
    }

    const scene = sceneRef.current;

    if (!scene) {
      return;
    }

    const maxTravel = Math.max(layout.travelPx, 1);
    const sceneStart = window.scrollY + scene.getBoundingClientRect().top;
    const targetProgress = Math.min(Math.max(targetOffset / maxTravel, 0), 1);

    window.scrollTo({
      top: sceneStart + targetProgress * layout.sceneDistance,
      behavior: "smooth",
    });
  };

  const scrollByCard = (direction: 1 | -1) => {
    if (prefersReducedMotion || layout.cardOffsets.length === 0) {
      return;
    }

    const threshold = 20;
    const candidateOffsets =
      direction === 1
        ? layout.cardOffsets.filter((offset) => offset > currentTravel + threshold)
        : [...layout.cardOffsets]
            .reverse()
            .filter((offset) => offset < currentTravel - threshold);

    const fallbackOffset =
      direction === 1
        ? layout.cardOffsets[layout.cardOffsets.length - 1]
        : layout.cardOffsets[0];
    const targetOffset = candidateOffsets[0] ?? fallbackOffset;

    scrollToCardOffset(targetOffset);
  };

  return (
    <section
      ref={sceneRef}
      id="sf-solutions"
      className={`${styles.sectionRoot} ${styles.solutionsScene} marketing-anchor`}
      style={sceneStyle}
    >
      <div className={stageClassName}>
        <div className={styles.wrapper}>
          <div className={styles.solutionsHeader}>
            <h2 className={`${styles.solutionsTitle} ${styles.t5}`}>
              Core Craft.
            </h2>
            <div className={styles.solutionsControls}>
              <button
                type="button"
                className={styles.solutionsControl}
                aria-label="Scroll solutions left"
                disabled={!hasPreviousCard}
                onClick={() => scrollByCard(-1)}
              >
                <SFArrowLeftIcon className={styles.solutionsControlIcon} />
              </button>
              <button
                type="button"
                className={styles.solutionsControl}
                aria-label="Scroll solutions right"
                disabled={!hasNextCard}
                onClick={() => scrollByCard(1)}
              >
                <SFArrowRightIcon className={styles.solutionsControlIcon} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={viewportRef}
          className={viewportClassName}
        >
          <div
            ref={trackRef}
            className={trackClassName}
            style={
              prefersReducedMotion
                ? undefined
                : { transform: `translate3d(${-currentTravel}px, 0, 0)` }
            }
          >
            {SOLUTIONS.map((solution, index) => (
              <a
                key={solution.title}
                className={`${styles.solutionItem} ${index >= 3 ? styles.solutionItemWithShadow : ""}`}
                href={solution.href}
              >
                <SolutionLines count={solution.lines} />
                <div>
                  <SolutionIcon icon={solution.icon} />
                  <h3 className={`${styles.solutionTitle} ${styles.p2}`}>{solution.title}</h3>
                  <p className={`${styles.solutionDescription} ${styles.p}`}>
                    {solution.description}
                  </p>
                  <span className={`${styles.monoPill} ${styles.solutionButton} ${styles.p}`}>
                    Explore
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
