"use client";

import {
  motion,
  MotionValue,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

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
      <motion.div
        className="flex gap-10"
        animate={paused ? { x: 0 } : undefined}
        style={{
          animation: paused ? "none" : animation,
          opacity,
          backgroundImage: gradient
            ? "linear-gradient(90deg, var(--mf-brand-blue), var(--mf-brand-red), var(--mf-text-heading))"
            : undefined,
          WebkitBackgroundClip: gradient ? "text" : undefined,
          backgroundClip: gradient ? "text" : undefined,
          color: gradient ? "transparent" : undefined,
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
      </motion.div>
      <motion.div
        className="flex gap-10"
        animate={paused ? { x: 0 } : undefined}
        style={{
          animation: paused ? "none" : animation,
          opacity,
          backgroundImage: gradient
            ? "linear-gradient(90deg, var(--mf-brand-blue), var(--mf-brand-red), var(--mf-text-heading))"
            : undefined,
          WebkitBackgroundClip: gradient ? "text" : undefined,
          backgroundClip: gradient ? "text" : undefined,
          color: gradient ? "transparent" : undefined,
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
      </motion.div>
    </div>
  );
}

type TheProblemProps = {
  splitProgress: MotionValue<number>;
};

export function TheProblem({ splitProgress }: TheProblemProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fallback = useMotionValue(0);
  const progress = splitProgress ?? fallback;
  const isInView = useInView(sectionRef, { margin: "200px" });
  const yTop = useTransform(progress, [0, 0.8], ["0%", "-100vh"]);
  const yBottom = useTransform(progress, [0, 0.8], ["0%", "100vh"]);

  return (
    <section
      ref={sectionRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="flex w-full flex-col gap-0">
        <motion.div style={{ y: yTop }} className="flex flex-col gap-0">
          <MarqueeRow text="SOFTWARE CREAKS." speed={15} opacity={0.03} direction={1} paused={!isInView} />
          <MarqueeRow text="SYSTEMS DRIFT." speed={20} opacity={0.05} direction={-1} paused={!isInView} />
          <MarqueeRow text="TEAMS STALL." speed={25} opacity={0.1} direction={1} paused={!isInView} />
          <MarqueeRow text="DELIVERY BREAKS." speed={30} opacity={1} direction={-1} paused={!isInView} />
        </motion.div>

        <motion.div style={{ y: yBottom }} className="flex flex-col gap-0">
          <MarqueeRow text="BUILD IT OR FAIL." speed={30} opacity={1} direction={1} gradient paused={!isInView} />
          <MarqueeRow text="OPERATE IT OR FAIL." speed={25} opacity={0.1} direction={-1} gradient paused={!isInView} />
          <MarqueeRow text="SECURE IT OR FAIL." speed={20} opacity={0.05} direction={1} gradient paused={!isInView} />
          <MarqueeRow text="SCALE IT OR FAIL." speed={15} opacity={0.03} direction={-1} gradient paused={!isInView} />
        </motion.div>
      </div>
    </section>
  );
}
