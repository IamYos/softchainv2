"use client";

import { useEffect, useRef } from "react";
import { ScrambleHeadlineLoop } from "@/components/marketing/ScrambleHeadlineLoop";
import { useInView } from "@/components/marketing/useInView";

type ScrambleTextTag = "div" | "h1" | "h2" | "h3" | "p" | "span";

const DEFAULT_SCRAMBLE_COLORS = ["#ff5841", "#50C878"] as const;

export type ScrambleTextRevealProps = {
  as?: ScrambleTextTag;
  lines: readonly string[];
  className?: string;
  loopClassName?: string;
  lineClassName?: string;
  resolvedColor: string;
  scrambleColors?: readonly string[];
  fitToContainer?: boolean;
  fitMode?: "both" | "width";
  minFontSizePx?: number;
  maxFontSizePx?: number;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  lineDelayMs?: number;
  letterSpacing?: string;
};

export function ScrambleTextReveal({
  as = "h2",
  lines,
  className = "",
  loopClassName = "flex w-full flex-col gap-[0.08em]",
  lineClassName = "block",
  resolvedColor,
  scrambleColors = DEFAULT_SCRAMBLE_COLORS,
  fitToContainer = false,
  fitMode = "both",
  minFontSizePx = 28,
  maxFontSizePx = 160,
  rootMargin = "-10% 0px",
  threshold = 0,
  once = true,
  lineDelayMs = 120,
  letterSpacing = "inherit",
}: ScrambleTextRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, {
    once,
    rootMargin,
    threshold,
  });
  const Tag = as;

  useEffect(() => {
    if (!fitToContainer) {
      return;
    }

    const heading = ref.current;
    if (!heading) {
      return;
    }

    let frameId = 0;

    const setFitFontSize = (value: number) => {
      const size = `${value}px`;
      heading.style.setProperty("--scramble-fit-font-size", size);
      heading.style.setProperty("--about-fit-font-size", size);
    };

    const fit = () => {
      const boundsElement = heading.parentElement ?? heading;
      const lineElements = Array.from(
        heading.querySelectorAll<HTMLElement>("[data-scramble-line='true']"),
      );

      const measureWidth = (element: HTMLElement) =>
        Math.max(
          element.scrollWidth,
          element.offsetWidth,
          Math.ceil(element.getBoundingClientRect().width),
        );

      const measureLineWidth = (line: HTMLElement) => {
        const whiteSpace = window.getComputedStyle(line).whiteSpace;
        const treatsTextAsSingleLine = whiteSpace.includes("nowrap");

        if (!treatsTextAsSingleLine) {
          return measureWidth(line);
        }

        const wordElements = Array.from(
          line.querySelectorAll<HTMLElement>("[data-scramble-word='true']"),
        );

        if (wordElements.length === 0) {
          return measureWidth(line);
        }

        return wordElements.reduce((total, word) => {
          const wordWidth = measureWidth(word);
          const marginRight = Number.parseFloat(window.getComputedStyle(word).marginRight) || 0;
          return total + wordWidth + marginRight;
        }, 0);
      };

      let low = minFontSizePx;
      let high = maxFontSizePx;
      let best = minFontSizePx;
      const availableWidth = Math.floor(boundsElement.getBoundingClientRect().width);

      if (availableWidth <= 0) {
        return;
      }

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        setFitFontSize(mid);

        const widestLine =
          lineElements.length > 0
            ? Math.max(...lineElements.map((line) => measureLineWidth(line)))
            : measureWidth(heading);

        const fitsWidth = widestLine <= availableWidth + 1;
        const fitsHeight =
          fitMode === "width" || heading.scrollHeight <= heading.clientHeight + 1;
        const fits = fitsWidth && fitsHeight;

        if (fits) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      setFitFontSize(best);
    };

    const scheduleFit = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(fit);
    };

    scheduleFit();

    const observer = new ResizeObserver(() => {
      scheduleFit();
    });

    observer.observe(heading);
    if (heading.parentElement) {
      observer.observe(heading.parentElement);
    }

    if (typeof document !== "undefined" && "fonts" in document) {
      void (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(() => {
        scheduleFit();
      });
    }

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [fitMode, fitToContainer, maxFontSizePx, minFontSizePx]);

  return (
    <Tag ref={ref as never} className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      <ScrambleHeadlineLoop
        active={isInView}
        lineSets={[lines]}
        lineDelayMs={lineDelayMs}
        resolvedColor={resolvedColor}
        scrambleColors={scrambleColors}
        className={loopClassName}
        lineClassName={lineClassName}
        letterSpacing={letterSpacing}
      />
    </Tag>
  );
}
