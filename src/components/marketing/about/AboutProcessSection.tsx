"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/usePrefersReducedMotion";
import { useScrollSceneProgress } from "@/components/marketing/useScrollSceneProgress";
import { ABOUT_PAGE_CONTENT } from "./aboutContent";
import styles from "./AboutPage.module.css";

const PROCESS_VIEWBOX = {
  width: 1080,
  height: 760,
  anchorY: 712,
} as const;

const PROCESS_DESKTOP_ANCHOR_X = 430;
const PROCESS_COMPACT_ANCHOR_X = PROCESS_VIEWBOX.width / 2;

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

function getStageCircle(index: number, anchorX: number) {
  const radius = PROCESS_STAGE_RADII[index];

  return {
    cx: anchorX,
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

function getStageFillPath(index: number, anchorX: number) {
  const outerCircle = getStageCircle(index, anchorX);

  if (index === 0) {
    return describeCirclePath(outerCircle.cx, outerCircle.cy, outerCircle.radius);
  }

  const innerCircle = getStageCircle(index - 1, anchorX);

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

function clampStageIndex(index: number) {
  return Math.max(0, Math.min(ABOUT_PAGE_CONTENT.process.stages.length - 1, index));
}

export function AboutProcessSection() {
  const sceneRef = useRef<HTMLElement>(null);
  const processBodyRef = useRef<HTMLDivElement>(null);
  const processVisualRef = useRef<SVGSVGElement>(null);
  const processDetailRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [sceneDistance, setSceneDistance] = useState(0);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
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

  const scrollDisabled = prefersReducedMotion || sceneDistance === 0 || isCompactViewport;
  const { progress } = useScrollSceneProgress(sceneRef, sceneDistance, scrollDisabled);
  const scrollStage = scrollDisabled
    ? 0
    : Math.min(
        ABOUT_PAGE_CONTENT.process.stages.length - 1,
        Math.round(progress * (ABOUT_PAGE_CONTENT.process.stages.length - 1)),
      );
  const activeStageIndex =
    hoveredStage ?? (isCompactViewport ? selectedStage : null) ?? scrollStage;
  const activeStage = ABOUT_PAGE_CONTENT.process.stages[activeStageIndex];
  const isFirstCompactStage = activeStageIndex === 0;
  const isLastCompactStage = activeStageIndex === ABOUT_PAGE_CONTENT.process.stages.length - 1;
  const processAnchorX = isCompactViewport ? PROCESS_COMPACT_ANCHOR_X : PROCESS_DESKTOP_ANCHOR_X;

  const sceneStyle = scrollDisabled
    ? undefined
    : ({
        height: `calc(100svh + ${sceneDistance}px)`,
      } as CSSProperties);

  const processSectionClassName = scrollDisabled
    ? `${styles.processSection} ${styles.processSectionReduced}`
    : styles.processSection;

  const selectCompactStage = (nextIndex: number) => {
    setSelectedStage(clampStageIndex(nextIndex));
  };

  useEffect(() => {
    const processBody = processBodyRef.current;
    const processVisual = processVisualRef.current;
    const processDetail = processDetailRef.current;

    if (
      isCompactViewport ||
      !processBody ||
      !processVisual ||
      !processDetail ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    const updateConnectorMetrics = () => {
      const bodyRect = processBody.getBoundingClientRect();
      const visualRect = processVisual.getBoundingClientRect();
      const detailRect = processDetail.getBoundingClientRect();
      const connectorLeft =
        visualRect.left -
        bodyRect.left +
        visualRect.width * (processAnchorX / PROCESS_VIEWBOX.width);
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
  }, [activeStageIndex, isCompactViewport, processAnchorX]);

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
                preserveAspectRatio={isCompactViewport ? "xMidYMax meet" : "xMinYMax meet"}
                aria-hidden="true"
              >
                <path
                  d={getStageFillPath(activeStageIndex, processAnchorX)}
                  fillRule="evenodd"
                  className={styles.processSvgActiveFill}
                />

                {ABOUT_PAGE_CONTENT.process.stages.map((stage, index) => {
                  const circle = getStageCircle(index, processAnchorX);

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
                          x={processAnchorX}
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
                    const coreCircle = getStageCircle(index, processAnchorX);

                    return (
                      <circle
                        key={`${stage.title}-hit`}
                        className={styles.processSvgHitArea}
                        cx={coreCircle.cx}
                        cy={coreCircle.cy}
                        r={coreCircle.radius}
                        onMouseEnter={() => setHoveredStage(index)}
                        onClick={() => setSelectedStage(index)}
                      />
                    );
                  }

                  return (
                    <path
                      key={`${stage.title}-hit`}
                      d={getStageFillPath(index, processAnchorX)}
                      fillRule="evenodd"
                      className={styles.processSvgHitArea}
                      onMouseEnter={() => setHoveredStage(index)}
                      onClick={() => setSelectedStage(index)}
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
          <div className={styles.processCompactDetail}>
            <div className={styles.processCompactTabBar}>
              <button
                type="button"
                className={styles.processCompactArrow}
                onClick={() => selectCompactStage(activeStageIndex - 1)}
                disabled={isFirstCompactStage}
                aria-label="Previous stage"
              >
                <span aria-hidden="true">←</span>
              </button>

              <button
                type="button"
                className={`${styles.processCompactStage} ${styles.processCompactStageActive}`}
                onClick={() => selectCompactStage(activeStageIndex)}
                aria-pressed="true"
              >
                <span className={styles.processCompactStageIndex}>
                  {formatStageIndex(activeStageIndex)} /{" "}
                  {String(ABOUT_PAGE_CONTENT.process.stages.length).padStart(2, "0")}
                </span>
                <span className={styles.processCompactStageLabel}>{activeStage.title}</span>
              </button>

              <button
                type="button"
                className={styles.processCompactArrow}
                onClick={() => selectCompactStage(activeStageIndex + 1)}
                disabled={isLastCompactStage}
                aria-label="Next stage"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>

            <p className={styles.processCompactDetailBody}>{activeStage.description}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
