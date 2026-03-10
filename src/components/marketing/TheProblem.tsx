"use client";

import { useRef } from "react";
import { useInView } from "@/components/marketing/useInView";

type MarqueeRowProps = {
  text: string;
  direction?: 1 | -1;
  speed?: number;
  opacity?: number;
  gradient?: boolean;
  paused?: boolean;
};

function MarqueeRow({
  text,
  direction = 1,
  speed = 20,
  opacity = 1,
  gradient = false,
  paused = false,
}: MarqueeRowProps) {
  const animation = `${speed}s linear infinite ${direction === 1 ? "marquee-infinite" : "marquee-infinite reverse"}`;

  return (
    <div className="flex overflow-hidden whitespace-nowrap py-1 select-none">
      <div
        className="flex gap-10"
        style={{
          animation,
          animationPlayState: paused ? "paused" : "running",
          opacity,
          backgroundImage: gradient
            ? "linear-gradient(90deg, var(--mf-brand-blue), var(--mf-brand-red), var(--mf-text-heading))"
            : undefined,
          WebkitBackgroundClip: gradient ? "text" : undefined,
          backgroundClip: gradient ? "text" : undefined,
          color: gradient ? "transparent" : undefined,
          willChange: "transform",
        }}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={`${text}-${index}`}
            className="text-[12vw] font-medium uppercase leading-[0.9] md:text-[100px]"
            style={{ letterSpacing: "-0.04em" }}
          >
            {text}
          </span>
        ))}
      </div>
      <div
        className="flex gap-10"
        style={{
          animation,
          animationPlayState: paused ? "paused" : "running",
          opacity,
          backgroundImage: gradient
            ? "linear-gradient(90deg, var(--mf-brand-blue), var(--mf-brand-red), var(--mf-text-heading))"
            : undefined,
          WebkitBackgroundClip: gradient ? "text" : undefined,
          backgroundClip: gradient ? "text" : undefined,
          color: gradient ? "transparent" : undefined,
          willChange: "transform",
        }}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={`${text}-repeat-${index}`}
            className="text-[12vw] font-medium uppercase leading-[0.9] md:text-[100px]"
            style={{ letterSpacing: "-0.04em" }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TheProblem() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, {
    once: false,
    rootMargin: "200px 0px",
  });

  return (
    <section
      ref={sectionRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="flex w-full flex-col gap-0">
        <div
          className="flex flex-col gap-0"
          style={{
            transform: "translate3d(0, var(--problem-y-top, 0px), 0)",
            willChange: "transform",
          }}
        >
          <MarqueeRow text="SOFTWARE CREAKS." speed={15} opacity={0.03} direction={1} paused={!isInView} />
          <MarqueeRow text="SYSTEMS DRIFT." speed={20} opacity={0.05} direction={-1} paused={!isInView} />
          <MarqueeRow text="TEAMS STALL." speed={25} opacity={0.1} direction={1} paused={!isInView} />
          <MarqueeRow text="DELIVERY BREAKS." speed={30} opacity={1} direction={-1} paused={!isInView} />
        </div>

        <div
          className="flex flex-col gap-0"
          style={{
            transform: "translate3d(0, var(--problem-y-bottom, 0px), 0)",
            willChange: "transform",
          }}
        >
          <MarqueeRow text="BUILD IT OR FAIL." speed={30} opacity={1} direction={1} gradient paused={!isInView} />
          <MarqueeRow text="OPERATE IT OR FAIL." speed={25} opacity={0.1} direction={-1} gradient paused={!isInView} />
          <MarqueeRow text="SECURE IT OR FAIL." speed={20} opacity={0.05} direction={1} gradient paused={!isInView} />
          <MarqueeRow text="SCALE IT OR FAIL." speed={15} opacity={0.03} direction={-1} gradient paused={!isInView} />
        </div>
      </div>
    </section>
  );
}
