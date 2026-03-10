"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "software",
  "infrastructure",
  "AI systems",
  "operations",
];

export function SwipeTextCycle() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exit" | "pre-enter">("visible");

  useEffect(() => {
    let frame = 0;
    let swap = 0;

    const timer = window.setInterval(() => {
      setPhase("exit");

      swap = window.setTimeout(() => {
        setIndex((current) => (current + 1) % WORDS.length);
        setPhase("pre-enter");
        frame = window.requestAnimationFrame(() => {
          setPhase("visible");
        });
      }, 220);

      return () => {
        window.clearTimeout(swap);
      };
    }, 2400);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      if (swap) {
        window.clearTimeout(swap);
      }
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex min-h-[3.5rem] items-end justify-center overflow-hidden">
      <span
        className="mr-2 text-xl text-[var(--mf-text-muted)] md:text-2xl"
        style={{ letterSpacing: "var(--mf-tracking-subheading)" }}
      >
        engineered across
      </span>
      <span
        className={`swipe-word swipe-word--${phase} text-xl font-medium text-white md:text-2xl`}
        style={{ letterSpacing: "var(--mf-tracking-subheading)" }}
      >
        {WORDS[index]}
      </span>
    </div>
  );
}
