"use client";

import Image from "next/image";

type SoftchainMarkProps = {
  className?: string;
};

export function SoftchainMark({ className = "" }: SoftchainMarkProps) {
  return (
    <div className={`relative h-full w-full shrink-0 ${className}`}>
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: "var(--header-logo-dark-opacity, 1)" }}
      >
        <Image
          src="/softchain-logo.png"
          alt=""
          fill
          sizes="130px"
          className="object-contain object-left"
        />
      </div>
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: "var(--header-logo-gray-opacity, 0)" }}
      >
        <Image
          src="/softchain-logo-gray.png"
          alt=""
          fill
          sizes="130px"
          className="object-contain object-left"
        />
      </div>
    </div>
  );
}
