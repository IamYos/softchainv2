"use client";

import { ReactNode, useRef } from "react";
import { useInView } from "@/components/marketing/useInView";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export function FadeIn({
  children,
  className = "",
  delayMs = 0,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    rootMargin: "-10% 0px",
  });

  return (
    <div
      ref={ref}
      className={`native-fade${isInView ? " is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
