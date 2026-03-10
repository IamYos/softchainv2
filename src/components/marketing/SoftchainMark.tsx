"use client";

import Image from "next/image";

type SoftchainMarkProps = {
  filter?: string;
  className?: string;
};

export function SoftchainMark({ filter, className = "" }: SoftchainMarkProps) {
  return (
    <div
      className={`relative h-full w-full shrink-0 ${className}`}
      style={{ filter: filter ?? "var(--header-logo-filter, brightness(0) invert(1))" }}
    >
      <Image
        src="/softchain-logo.png"
        alt="Softchain"
        fill
        sizes="130px"
        className="object-contain object-left"
      />
    </div>
  );
}
