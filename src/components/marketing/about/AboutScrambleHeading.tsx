"use client";

import { useEffect, useRef } from "react";
import { ScrambleHeadlineLoop } from "@/components/marketing/ScrambleHeadlineLoop";
import { useInView } from "@/components/marketing/useInView";

type AboutScrambleHeadingProps = {
  as?: "h1" | "h2";
  lines: readonly string[];
  className?: string;
  lineClassName: string;
  resolvedColor: string;
  scrambleColors?: readonly string[];
  fitToContainer?: boolean;
  fitMode?: "both" | "width";
  minFontSizePx?: number;
  maxFontSizePx?: number;
};

export function AboutScrambleHeading({
  as = "h2",
  lines,
  className = "",
  lineClassName,
  resolvedColor,
  scrambleColors = ["#ff5841", "#50C878"],
  fitToContainer = false,
  fitMode = "both",
  minFontSizePx = 28,
  maxFontSizePx = 160,
}: AboutScrambleHeadingProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const isInView = useInView(ref, {
    once: true,
    rootMargin: "-10% 0px",
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
        heading.style.setProperty("--about-fit-font-size", `${mid}px`);

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

      heading.style.setProperty("--about-fit-font-size", `${best}px`);
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
  }, [fitMode, fitToContainer, lines, maxFontSizePx, minFontSizePx]);

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      <ScrambleHeadlineLoop
        active={isInView}
        lineSets={[lines]}
        lineDelayMs={120}
        resolvedColor={resolvedColor}
        scrambleColors={scrambleColors}
        className="flex w-full flex-col gap-[0.08em]"
        lineClassName={lineClassName}
        letterSpacing="inherit"
      />
    </Tag>
  );
}
