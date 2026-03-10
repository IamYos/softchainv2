"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const WORDS = [
  "software",
  "infrastructure",
  "AI systems",
  "operations",
];

export function SwipeTextCycle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % WORDS.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-[3.5rem] items-end justify-center overflow-hidden">
      <span
        className="mr-2 text-xl text-[var(--mf-text-muted)] md:text-2xl"
        style={{ letterSpacing: "var(--mf-tracking-subheading)" }}
      >
        engineered across
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={WORDS[index]}
          initial={{ y: 36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -36, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xl font-medium text-white md:text-2xl"
          style={{ letterSpacing: "var(--mf-tracking-subheading)" }}
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
