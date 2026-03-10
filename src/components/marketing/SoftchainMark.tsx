"use client";

import { motion, MotionValue, useTransform } from "framer-motion";
import Image from "next/image";

type SoftchainMarkProps = {
  brightness: MotionValue<number>;
};

export function SoftchainMark({ brightness }: SoftchainMarkProps) {
  const inverseOpacity = useTransform(brightness, (value) => 1 - value);

  return (
    <div className="relative h-[34px] w-[148px] shrink-0">
      <motion.div
        className="absolute inset-0"
        style={{ opacity: brightness }}
        aria-hidden
      >
        <Image
          src="/softchain-logo-white.png"
          alt=""
          fill
          sizes="148px"
          className="object-contain"
        />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        style={{ opacity: inverseOpacity }}
        aria-hidden
      >
        <Image
          src="/softchain-logo.png"
          alt=""
          fill
          sizes="148px"
          className="object-contain"
        />
      </motion.div>
      <span className="sr-only">Softchain</span>
    </div>
  );
}
