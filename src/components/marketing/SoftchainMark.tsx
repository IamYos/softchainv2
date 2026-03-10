"use client";

import { motion, MotionValue, useTransform } from "framer-motion";
import Image from "next/image";

type SoftchainMarkProps = {
  brightness: MotionValue<number>;
  className?: string;
};

export function SoftchainMark({
  brightness,
  className = "",
}: SoftchainMarkProps) {
  const inverseOpacity = useTransform(brightness, (value) => 1 - value);

  return (
    <div className={`relative h-full w-full shrink-0 ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{ opacity: brightness }}
        aria-hidden
      >
        <Image
          src="/softchain-logo-white.png"
          alt=""
          fill
          sizes="130px"
          className="object-contain object-left"
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
          sizes="130px"
          className="object-contain object-left"
        />
      </motion.div>
      <span className="sr-only">Softchain</span>
    </div>
  );
}
