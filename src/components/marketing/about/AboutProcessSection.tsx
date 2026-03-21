"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/usePrefersReducedMotion";
import { useScrollSceneProgress } from "@/components/marketing/useScrollSceneProgress";
import { ABOUT_PAGE_CONTENT } from "./aboutContent";
import styles from "./AboutPage.module.css";

const PROCESS_VIEWBOX = {
  width: 1080,
  height: 760,
  anchorX: 430,
  anchorY: 712,
} as const;

const PROCESS_STAGE_RADII = [82, 154, 226, 298, 350] as const;
const PROCESS_LABEL_LINE_HEIGHT = 18;

const INITIAL_BINARY_ROWS = [
  "01110110 10011011 00101011",
  "11010110 11011001 10111000",
  "00110111 01011101 00010010",
  "00011001 01100101 11110001",
  "10111110 11000101 10101000",
  "11000100 10111010 01010001",
] as const;

function createBinaryRows() {
  return Array.from({ length: 6 }, () =>
    Array.from({ length: 3 }, () =>
      Array.from({ length: 8 }, () => (Math.random() > 0.5 ? "1" : "0")).join(""),
    ).join(" "),
  );
}

function formatStageIndex(value: number) {
  return String(value + 1).padStart(2, "0");
}

function getStageCircle(index: number) {
  const radius = PROCESS_STAGE_RADII[index];

  return {
    cx: PROCESS_VIEWBOX.anchorX,
    cy: PROCESS_VIEWBOX.anchorY - radius,
    radius,
  };
}

function describeCirclePath(cx: number, cy: number, radius: number) {
  return [
    `M ${cx} ${cy - radius}`,
    `A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}`,
    `A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius}`,
    "Z",
  ].join(" ");
}

function getStageFillPath(index: number) {
  const outerCircle = getStageCircle(index);

  if (index === 0) {
    return describeCirclePath(outerCircle.cx, outerCircle.cy, outerCircle.radius);
  }

  const innerCircle = getStageCircle(index - 1);

  return [
    describeCirclePath(outerCircle.cx, outerCircle.cy, outerCircle.radius),
    describeCirclePath(innerCircle.cx, innerCircle.cy, innerCircle.radius),
  ].join(" ");
}

function getStageLabelY(index: number) {
  if (index === 0) {
    return PROCESS_VIEWBOX.anchorY - PROCESS_STAGE_RADII[0] * 0.78;
  }

  return PROCESS_VIEWBOX.anchorY - (PROCESS_STAGE_RADII[index] + PROCESS_STAGE_RADII[index - 1]);
}

function getStageTopY(index: number) {
  return PROCESS_VIEWBOX.anchorY - PROCESS_STAGE_RADII[index] * 2;
}

function getStageLabelLines(label: readonly string[]) {
  const startOffset = ((label.length - 1) * PROCESS_LABEL_LINE_HEIGHT) / 2;

  return label.map((line, lineIndex) => ({
    line,
    yOffset: lineIndex * PROCESS_LABEL_LINE_HEIGHT - startOffset,
  }));
}

export function AboutProcessSection() {
  const sceneRef = useRef<HTMLElement>(null);
  const processBodyRef = useRef<HTMLDivElement>(null);
  const processVisualRef = useRef<SVGSVGElement>(null);
  const processDetailRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [sceneDistance, setSceneDistance] = useState(0);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [isSceneVisible, setIsSceneVisible] = useState(true);
  const [binaryRows, setBinaryRows] = useState<string[]>(() => [...INITIAL_BINARY_ROWS]);
  const [connectorMetrics, setConnectorMetrics] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    const updateViewportMode = () => {
      const compactViewport = window.innerWidth <= 1024;
      setIsCompactViewport(compactViewport);
      setSceneDistance(
        compactViewport ? Math.round(window.innerHeight * 1.2) : Math.round(window.innerHeight * 2.6),
      );
    };

    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);

    return () => {
      window.removeEventListener("resize", updateViewportMode);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSceneVisible(entry.isIntersecting);
      },
      {
        threshold: 0.16,
      },
    );

    observer.observe(scene);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isSceneVisible) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setBinaryRows(createBinaryRows());
    }, 180);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSceneVisible, prefersReducedMotion]);

  const scrollDisabled = prefersReducedMotion || sceneDistance === 0;
  const { progress } = useScrollSceneProgress(sceneRef, sceneDistance, scrollDisabled);
  const scrollStage = scrollDisabled
    ? 0
    : Math.min(
        ABOUT_PAGE_CONTENT.process.stages.length - 1,
        Math.round(progress * (ABOUT_PAGE_CONTENT.process.stages.length - 1)),
      );
  const activeStageIndex = hoveredStage ?? scrollStage;
  const activeStage = ABOUT_PAGE_CONTENT.process.stages[activeStageIndex];

  const sceneStyle = scrollDisabled
    ? undefined
    : ({
        height: `calc(100svh + ${sceneDistance}px)`,
      } as CSSProperties);

  const processSectionClassName = scrollDisabled
    ? `${styles.processSection} ${styles.processSectionReduced}`
    : styles.processSection;

  useEffect(() => {
    const processBody = processBodyRef.current;
    const processVisual = processVisualRef.current;
    const processDetail = processDetailRef.current;

    if (!processBody || !processVisual || !processDetail || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateConnectorMetrics = () => {
      const bodyRect = processBody.getBoundingClientRect();
      const visualRect = processVisual.getBoundingClientRect();
      const detailRect = processDetail.getBoundingClientRect();
      const connectorLeft =
        visualRect.left -
        bodyRect.left +
        visualRect.width * (PROCESS_VIEWBOX.anchorX / PROCESS_VIEWBOX.width);
      const connectorTop =
        visualRect.top -
        bodyRect.top +
        visualRect.height * (getStageTopY(activeStageIndex) / PROCESS_VIEWBOX.height);
      const connectorEnd = detailRect.left - bodyRect.left - 40;

      setConnectorMetrics({
        left: connectorLeft,
        top: connectorTop,
        width: Math.max(0, connectorEnd - connectorLeft),
      });
    };

    updateConnectorMetrics();

    const resizeObserver = new ResizeObserver(() => {
      updateConnectorMetrics();
    });

    resizeObserver.observe(processBody);
    resizeObserver.observe(processVisual);
    resizeObserver.observe(processDetail);
    window.addEventListener("resize", updateConnectorMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateConnectorMetrics);
    };
  }, [activeStageIndex]);

  return (
    <section
      ref={sceneRef}
      id="about-snapshot"
      className={`${styles.processScene} marketing-anchor`}
      style={sceneStyle}
      onMouseLeave={() => setHoveredStage(null)}
    >
      <div className={processSectionClassName}>
        <div className={styles.processTop}>
          <div className={styles.processIntro}>
            <h2 className={styles.processHeading}>{ABOUT_PAGE_CONTENT.process.heading}</h2>
            <div className={styles.processCount}>
              <span className={styles.processCountCurrent}>
                {formatStageIndex(activeStageIndex)}
              </span>
              <span className={styles.processCountDivider}>/</span>
              <span className={styles.processCountTotal}>
                {String(ABOUT_PAGE_CONTENT.process.stages.length).padStart(2, "0")}
              </span>
            </div>
            <p className={styles.processLead}>{ABOUT_PAGE_CONTENT.process.description}</p>
          </div>

          <div className={styles.processBinaryCluster} aria-hidden="true">
            {binaryRows.map((row, rowIndex) => (
              <span
                key={`${rowIndex}-${row}`}
                className={styles.processBinaryRow}
                style={{ transitionDelay: `${rowIndex * 40}ms` } as CSSProperties}
              >
                {row}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.processBody} ref={processBodyRef}>
          {!isCompactViewport && connectorMetrics ? (
            <div
              className={styles.processConnector}
              style={
                {
                  left: `${connectorMetrics.left}px`,
                  top: `${connectorMetrics.top}px`,
                  width: `${connectorMetrics.width}px`,
                } as CSSProperties
              }
              aria-hidden="true"
            />
          ) : null}

          <div className={styles.processVisual}>
            <div className={styles.processVisualField}>
              <svg
                ref={processVisualRef}
                className={styles.processSvg}
                viewBox={`0 0 ${PROCESS_VIEWBOX.width} ${PROCESS_VIEWBOX.height}`}
                preserveAspectRatio="xMinYMax meet"
                aria-hidden="true"
              >
                <path
                  d={getStageFillPath(activeStageIndex)}
                  fillRule="evenodd"
                  className={styles.processSvgActiveFill}
                />

                {ABOUT_PAGE_CONTENT.process.stages.map((stage, index) => {
                  const circle = getStageCircle(index);

                  return (
                    <circle
                      key={`${stage.title}-ring`}
                      className={styles.processSvgRing}
                      cx={circle.cx}
                      cy={circle.cy}
                      r={circle.radius}
                    />
                  );
                })}

                {ABOUT_PAGE_CONTENT.process.stages.map((stage, index) => {
                  const labelY = getStageLabelY(index);
                  const isActive = index === activeStageIndex;
                  const labelLines = getStageLabelLines(stage.visualLabel);

                  return (
                    <g
                      key={`${stage.title}-label`}
                    >
                      {labelLines.map(({ line, yOffset }) => (
                        <text
                          key={line}
                          x={PROCESS_VIEWBOX.anchorX}
                          y={labelY + yOffset}
                          textAnchor="middle"
                          className={`${styles.processSvgLabel} ${
                            isActive ? styles.processSvgLabelActive : ""
                          }`}
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                })}

                {ABOUT_PAGE_CONTENT.process.stages.map((stage, index) => {
                  if (index === 0) {
                    const coreCircle = getStageCircle(index);

                    return (
                      <circle
                        key={`${stage.title}-hit`}
                        className={styles.processSvgHitArea}
                        cx={coreCircle.cx}
                        cy={coreCircle.cy}
                        r={coreCircle.radius}
                        onMouseEnter={() => setHoveredStage(index)}
                      />
                    );
                  }

                  return (
                    <path
                      key={`${stage.title}-hit`}
                      d={getStageFillPath(index)}
                      fillRule="evenodd"
                      className={styles.processSvgHitArea}
                      onMouseEnter={() => setHoveredStage(index)}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          <aside className={styles.processDetail} ref={processDetailRef}>
            <div className={styles.processDetailInner}>
              <p className={styles.processDetailKicker}>{activeStage.title}</p>
              <p className={styles.processDetailBody}>{activeStage.description}</p>
            </div>

            <div className={styles.processDetailList}>
              {ABOUT_PAGE_CONTENT.process.stages.map((stage, index) => (
                <button
                  key={`${stage.title}-detail`}
                  type="button"
                  className={`${styles.processDetailStage} ${
                    index === activeStageIndex ? styles.processDetailStageActive : ""
                  }`}
                  onMouseEnter={() => setHoveredStage(index)}
                  onFocus={() => setHoveredStage(index)}
                >
                  <span className={styles.processDetailStageIndex}>
                    {formatStageIndex(index)}
                  </span>
                  <span className={styles.processDetailStageTitle}>{stage.title}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>

        {isCompactViewport ? (
          <div className={styles.processCompactRail}>
            {ABOUT_PAGE_CONTENT.process.stages.map((stage, index) => (
              <button
                key={`${stage.title}-compact`}
                type="button"
                className={`${styles.processCompactStage} ${
                  index === activeStageIndex ? styles.processCompactStageActive : ""
                }`}
                onClick={() => setHoveredStage(index)}
              >
                <span className={styles.processCompactStageIndex}>{formatStageIndex(index)}</span>
                <span className={styles.processCompactStageLabel}>{stage.title}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
