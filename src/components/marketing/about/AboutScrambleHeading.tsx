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
      let low = minFontSizePx;
      let high = maxFontSizePx;
      let best = minFontSizePx;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        heading.style.setProperty("--about-fit-font-size", `${mid}px`);

        const fits =
          heading.scrollWidth <= heading.clientWidth + 1 &&
          heading.scrollHeight <= heading.clientHeight + 1;

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
  }, [fitToContainer, lines, maxFontSizePx, minFontSizePx]);

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
