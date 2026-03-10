"use client";

import { motion, type MotionProps } from "framer-motion";
import Link from "next/link";
import { ReactNode, useState } from "react";

type BeamButtonProps = MotionProps & {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  theme?: "dark" | "light";
  gradientBorder?: boolean;
};

export function BeamButton({
  children,
  className = "",
  href,
  onClick,
  theme = "dark",
  gradientBorder = false,
  ...motionProps
}: BeamButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
  );

  const themeClasses =
    theme === "light"
      ? "bg-white text-black border-black/20"
      : "bg-[var(--mf-bg-base)] text-white border-white/20";

  const content = (
    <>
      <span
        className="absolute inset-0 rounded-[inherit] transition-opacity duration-200"
        style={{
          backgroundColor:
            theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)",
          opacity: isHovered ? 1 : 0,
        }}
      />
      <span className="relative z-10">{children}</span>
      {!gradientBorder && !isTouchDevice ? (
        <span
          className={`absolute inset-[-1px] overflow-hidden rounded-[inherit] transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          style={{
            WebkitMask:
              "linear-gradient(#fff,#fff) 0 0/100% 1px no-repeat,linear-gradient(#fff,#fff) 0 100%/100% 1px no-repeat,linear-gradient(#fff,#fff) 0 0/1px 100% no-repeat,linear-gradient(#fff,#fff) 100% 0/1px 100% no-repeat",
            mask: "linear-gradient(#fff,#fff) 0 0/100% 1px no-repeat,linear-gradient(#fff,#fff) 0 100%/100% 1px no-repeat,linear-gradient(#fff,#fff) 0 0/1px 100% no-repeat,linear-gradient(#fff,#fff) 100% 0/1px 100% no-repeat",
          }}
        >
          <span
            className="absolute left-1/2 top-1/2 h-[1000px] w-[1000px]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg 200deg, var(--mf-brand-blue) 260deg, var(--mf-brand-red) 320deg, transparent 360deg)",
              translate: "-50% -50%",
              animation: `beam-spin ${isHovered ? "1.5s" : "4s"} ${isHovered ? "cubic-bezier(0.35, 0.15, 0.5, 0.95)" : "linear"} infinite`,
            }}
          />
        </span>
      ) : null}
      {gradientBorder && !isTouchDevice ? (
        <span
          className="absolute inset-0 rounded-[inherit] p-px"
          style={{
            background:
              "conic-gradient(from var(--border-angle), var(--mf-brand-blue), var(--mf-brand-red), var(--mf-brand-blue))",
            animation: `spin-border ${isHovered ? "1.5s" : "4s"} linear infinite`,
          }}
        >
          <span
            className="block h-full w-full rounded-[inherit]"
            style={{
              background:
                theme === "light" ? "#ffffff" : "var(--mf-bg-base)",
            }}
          />
        </span>
      ) : null}
    </>
  );

  const sharedClassName =
    `relative inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-[4px] border px-6 text-sm font-medium tracking-tight transition-colors duration-200 ${themeClasses} ${className}`;

  if (href) {
    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...motionProps}
      >
        <Link href={href} className={sharedClassName}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={sharedClassName}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
