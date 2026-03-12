"use client";

import { useRef } from "react";
import styles from "./Shift5PostFrame.module.css";
import {
  Shift5ArrowLeftIcon,
  Shift5ArrowRightIcon,
  Shift5DefaultIcon,
  Shift5GlobeIcon,
  Shift5TriangleIcon,
} from "./Shift5SourceIcons";

const SOLUTIONS = [
  {
    title: "Software Engineering",
    description:
      "Web platforms, client portals, dashboards, internal systems, and production software delivery built to hold up under real operational load.",
    href: "#shift5-solutions",
    icon: "globe" as const,
    lines: 3,
  },
  {
    title: "AI Systems",
    description:
      "RAG, workflow automation, intelligent interfaces, and private or hybrid inference pipelines deployed where they create measurable business value.",
    href: "#shift5-insights",
    icon: "dots" as const,
    lines: 3,
  },
  {
    title: "Infrastructure",
    description:
      "Cloud, on-premise, and hybrid environments handled end to end, including networking, observability, security posture, migrations, and long-term support.",
    href: "#closing-cta",
    icon: "default" as const,
    lines: 4,
  },
  {
    title: "Mobile Delivery",
    description:
      "Native iOS and Android products for internal tools and public apps where platform quality, security, and maintainability cannot be compromised.",
    href: "#closing-cta",
    icon: "triangle" as const,
    lines: 0,
  },
] as const;

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
    return <Shift5GlobeIcon className={styles.solutionIconShell} />;
  }

  if (icon === "default") {
    return <Shift5DefaultIcon className={styles.solutionIconShell} />;
  }

  if (icon === "triangle") {
    return <Shift5TriangleIcon className={styles.solutionIconShell} />;
  }

  return <div className={styles.solutionDotsIcon} aria-hidden="true" />;
}

export function Shift5SolutionSlider() {
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const delta = Math.max(viewport.clientWidth * 0.72, 320) * direction;
    viewport.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section
      id="shift5-solutions"
      className={`${styles.sectionRoot} ${styles.solutionsSection}`}
    >
      <div className={styles.wrapper}>
        <div className={styles.solutionsHeader}>
          <h2 className={`${styles.solutionsTitle} ${styles.t5}`}>
            Software, AI, and Infrastructure.
          </h2>
          <div className={styles.solutionsControls}>
            <button
              type="button"
              className={styles.solutionsControl}
              aria-label="Scroll solutions left"
              onClick={() => scrollByCard(-1)}
            >
              <Shift5ArrowLeftIcon className={styles.solutionsControlIcon} />
            </button>
            <button
              type="button"
              className={styles.solutionsControl}
              aria-label="Scroll solutions right"
              onClick={() => scrollByCard(1)}
            >
              <Shift5ArrowRightIcon className={styles.solutionsControlIcon} />
            </button>
          </div>
        </div>
      </div>

      <div ref={viewportRef} className={styles.solutionsViewport}>
        <div className={styles.solutionsTrack}>
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
    </section>
  );
}
