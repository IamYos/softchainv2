"use client";

import { motion, type MotionValue } from "framer-motion";
import Image from "next/image";

type SoftchainMarkProps = {
  filter: MotionValue<string> | string;
  className?: string;
};

export function SoftchainMark({ filter, className = "" }: SoftchainMarkProps) {
  return (
    <div className={`relative h-full w-full shrink-0 ${className}`}>
      <motion.div className="absolute inset-0" style={{ filter }}>
        <Image
          src="/softchain-logo.png"
          alt="Softchain"
          fill
          sizes="130px"
          className="object-contain object-left"
        />
      </motion.div>
    </div>
  );
}
