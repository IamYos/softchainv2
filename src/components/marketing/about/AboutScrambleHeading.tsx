"use client";

import { useRef } from "react";
import { ScrambleHeadlineLoop } from "@/components/marketing/ScrambleHeadlineLoop";
import { useInView } from "@/components/marketing/useInView";

type AboutScrambleHeadingProps = {
  as?: "h1" | "h2";
  lines: readonly string[];
  className?: string;
  lineClassName: string;
  resolvedColor: string;
  scrambleColors?: readonly string[];
};

export function AboutScrambleHeading({
  as = "h2",
  lines,
  className = "",
  lineClassName,
  resolvedColor,
  scrambleColors = ["#ff5841", "#50C878"],
}: AboutScrambleHeadingProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const isInView = useInView(ref, {
    once: true,
    rootMargin: "-10% 0px",
  });
  const Tag = as;

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
