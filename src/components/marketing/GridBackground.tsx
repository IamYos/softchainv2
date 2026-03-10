"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

type GridBackgroundProps = {
  scrollProgress: MotionValue<number>;
};

export function GridBackground({ scrollProgress }: GridBackgroundProps) {
  const opacity = useTransform(scrollProgress, [0, 0.18, 0.32], [0.55, 0.32, 0]);
  const scale = useTransform(scrollProgress, [0, 0.3], [1, 1.08]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 softchain-grid"
      style={{ opacity, scale }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(220,38,38,0.12),transparent_30%)]" />
    </motion.div>
  );
}
