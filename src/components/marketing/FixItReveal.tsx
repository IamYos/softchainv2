"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

type FixItRevealProps = {
  splitProgress: MotionValue<number>;
};

const LINES = [
  "Scope the architecture before delivery begins.",
  "Build the system cleanly, with senior execution.",
  "Operate it long after launch without drift.",
];

export function FixItReveal({ splitProgress }: FixItRevealProps) {
  const textTop = useTransform(splitProgress, [0.2, 0.5], ["50%", "10%"]);
  const textOffsetY = useTransform(splitProgress, [0.2, 0.5], [80, 0]);
  const textOpacity = useTransform(splitProgress, [0.2, 0.35], [0, 1]);
  const textScale = useTransform(splitProgress, [0.2, 0.5], [1.05, 1]);
  const burstScale = useTransform(splitProgress, [0.2, 0.45], [0.4, 1.8]);
  const burstOpacity = useTransform(splitProgress, [0.2, 0.25, 0.45], [0, 0.42, 0]);
  const panelOpacity = useTransform(splitProgress, [0.3, 0.4, 0.65], [0, 1, 1]);
  const panelY = useTransform(splitProgress, [0.28, 0.5], [90, 0]);
  const panelScale = useTransform(splitProgress, [0.28, 0.5], [0.92, 1]);

  return (
    <section className="absolute inset-0">
      <motion.div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28),rgba(220,38,38,0.18),transparent_68%)] blur-3xl"
        style={{
          opacity: burstOpacity,
          scale: burstScale,
          x: "-50%",
          y: "-50%",
        }}
      />

      <motion.div
        className="absolute left-1/2 z-10 flex w-full max-w-[760px] -translate-x-1/2 flex-col items-center px-6 text-center"
        style={{
          top: textTop,
          y: textOffsetY,
          opacity: textOpacity,
          scale: textScale,
        }}
      >
        <p
          className="mb-4 text-sm font-medium uppercase text-[var(--mf-text-muted)]"
          style={{ letterSpacing: "0.16em" }}
        >
          Softchain fixes the middle
        </p>
        <h2
          className="text-balance text-4xl font-medium text-white md:text-6xl"
          style={{ letterSpacing: "var(--mf-tracking-section-heading)" }}
        >
          Senior engineering for software, infrastructure, and AI operations.
        </h2>
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-1/2 z-20 w-[min(92vw,820px)] -translate-x-1/2 rounded-[28px] border border-white/10 bg-[rgba(17,17,17,0.92)] p-5 backdrop-blur-xl md:p-7"
        style={{
          opacity: panelOpacity,
          y: panelY,
          scale: panelScale,
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-[var(--mf-text-muted)]">
              Operating model
            </p>
            <h3 className="mt-1 text-lg font-medium text-white md:text-2xl">
              Architecture, build, and support in one execution line.
            </h3>
          </div>
          <div className="hidden gap-2 md:flex">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--mf-text-muted)]">
              Dubai
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--mf-text-muted)]">
              Global Delivery
            </span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {LINES.map((line, index) => (
            <motion.div
              key={line}
              className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.08 * index,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="text-xs text-[var(--mf-text-muted)]">
                0{index + 1}
              </span>
              <p className="mt-3 text-sm leading-6 text-[var(--mf-text-body)]">
                {line}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
