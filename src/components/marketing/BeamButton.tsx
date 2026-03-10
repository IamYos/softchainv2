"use client";

import Link from "next/link";
import { CSSProperties, ReactNode } from "react";

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
          color: "#000000",
          borderColor: "rgba(0, 0, 0, 0.2)",
          ["--beam-overlay" as string]: "rgba(0, 0, 0, 0.05)",
          ["--btn-active-bg" as string]: "#171717",
          ["--btn-active-text" as string]: "#ffffff",
          ["--btn-active-border" as string]: "rgba(255, 255, 255, 0.28)",
        }
      : {
          backgroundColor: "var(--mf-bg-base)",
          color: "#ffffff",
          borderColor: "rgba(255, 255, 255, 0.2)",
          ["--beam-overlay" as string]: "rgba(255, 255, 255, 0.06)",
          ["--btn-active-bg" as string]: "#ffffff",
          ["--btn-active-text" as string]: "#171717",
          ["--btn-active-border" as string]: "rgba(0, 0, 0, 0.28)",
        };

  const sharedStyle = {
    ...defaultStyle,
    ...style,
  };

  const content = (
    <>
      <span className="beam-button__overlay absolute inset-0 rounded-[inherit]" />
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden="true"
        className="beam-button__beam absolute inset-[-1px] overflow-hidden rounded-[inherit]"
        style={{
          WebkitMask:
            "linear-gradient(#fff,#fff) 0 0/100% 1px no-repeat,linear-gradient(#fff,#fff) 0 100%/100% 1px no-repeat,linear-gradient(#fff,#fff) 0 0/1px 100% no-repeat,linear-gradient(#fff,#fff) 100% 0/1px 100% no-repeat",
          mask: "linear-gradient(#fff,#fff) 0 0/100% 1px no-repeat,linear-gradient(#fff,#fff) 0 100%/100% 1px no-repeat,linear-gradient(#fff,#fff) 0 0/1px 100% no-repeat,linear-gradient(#fff,#fff) 100% 0/1px 100% no-repeat",
        }}
      >
        <span className="beam-button__beam-core absolute left-1/2 top-1/2 h-[1000px] w-[1000px]" />
      </span>
    </>
  );

  const sharedClassName =
    `beam-button relative inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-[4px] border px-6 text-sm font-medium tracking-tight ${className}`;

  if (href) {
    return (
      <Link href={href} className={sharedClassName} style={sharedStyle} data-theme={theme}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={sharedClassName}
      style={sharedStyle}
      data-theme={theme}
    >
      {content}
    </button>
  );
}
