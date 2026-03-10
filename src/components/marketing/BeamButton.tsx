"use client";

import Link from "next/link";
import { CSSProperties, ReactNode } from "react";

const BEAM_MASK =
  "linear-gradient(#fff,#fff) 0 0/100% 2px no-repeat," +
  "linear-gradient(#fff,#fff) 0 100%/100% 2px no-repeat," +
  "linear-gradient(#fff,#fff) 0 0/2px 100% no-repeat," +
  "linear-gradient(#fff,#fff) 100% 0/2px 100% no-repeat";

type BeamButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  theme?: "dark" | "light";
  style?: CSSProperties;
};

export function BeamButton({
  children,
  className = "",
  href,
  onClick,
  theme = "dark",
  style,
}: BeamButtonProps) {
  const defaultStyle: CSSProperties =
    theme === "light"
      ? {
          backgroundColor: "#ffffff",
          color: "#171717",
          borderColor: "rgba(23, 23, 23, 0.28)",
          ["--beam-overlay" as string]: "rgba(0, 0, 0, 0.05)",
          ["--btn-active-bg" as string]: "#171717",
          ["--btn-active-text" as string]: "#ffffff",
          ["--btn-active-border" as string]: "rgba(255, 255, 255, 0.28)",
        }
      : {
          backgroundColor: "transparent",
          color: "#ffffff",
          borderColor: "rgba(255, 255, 255, 0.28)",
          ["--beam-overlay" as string]: "rgba(255, 255, 255, 0.06)",
          ["--btn-active-bg" as string]: "#ffffff",
          ["--btn-active-text" as string]: "#171717",
          ["--btn-active-border" as string]: "rgba(0, 0, 0, 0.28)",
        };

  const mergedStyle = { ...defaultStyle, ...style };

  const content = (
    <>
      {/* Hover overlay */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100"
        style={{ backgroundColor: "var(--beam-overlay)" }}
      />

      {/* Text */}
      <span className="relative z-10">{children}</span>

      {/* Beam border — visible on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-1px] overflow-hidden rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100"
        style={{ WebkitMask: BEAM_MASK, mask: BEAM_MASK }}
      >
        <span
          className="beam-beam-core absolute left-1/2 top-1/2 h-[1000px] w-[1000px]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg 200deg, var(--mf-brand-blue) 260deg, var(--mf-brand-red) 320deg, transparent 360deg)",
            translate: "-50% -50%",
            animation: "beam-spin 4s linear infinite",
          }}
        />
      </span>
    </>
  );

  const sharedClassName = `beam-button group relative inline-flex cursor-pointer items-center justify-center rounded border px-4 py-2 text-sm font-medium ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={sharedClassName}
        style={mergedStyle}
        data-theme={theme}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={sharedClassName}
      style={mergedStyle}
      data-theme={theme}
    >
      {content}
    </button>
  );
}
