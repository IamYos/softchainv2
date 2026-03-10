"use client";

import { CSSProperties } from "react";
import { BeamButton } from "@/components/marketing/BeamButton";

type HeaderDesktopActionsProps = {
  onSecondaryClick: () => void;
  onPrimaryClick: () => void;
  className?: string;
};

export function HeaderDesktopActions({
  onSecondaryClick,
  onPrimaryClick,
  className = "",
}: HeaderDesktopActionsProps) {
  return (
    <div className={`items-center gap-4 ${className}`}>
      <BeamButton
        onClick={onSecondaryClick}
        className="min-h-0 rounded px-4 py-2 text-sm font-medium border transition-colors duration-300"
        theme="dark"
        style={{
          borderColor: "var(--header-secondary-border)",
          backgroundColor: "var(--header-secondary-bg)",
          color: "var(--header-text)",
          ["--beam-overlay" as string]: "rgba(255, 255, 255, 0.06)",
          ["--btn-active-bg" as string]: "var(--header-text)",
          ["--btn-active-text" as string]: "var(--header-primary-text)",
          ["--btn-active-border" as string]: "var(--header-primary-text)",
        } as CSSProperties}
      >
        Contact
      </BeamButton>
      <BeamButton
        onClick={onPrimaryClick}
        className="min-h-0 rounded px-4 py-2 text-sm font-medium border transition-colors duration-300 whitespace-nowrap"
        style={{
          borderColor: "var(--header-secondary-border)",
          backgroundColor: "var(--header-primary-bg)",
          color: "var(--header-primary-text)",
          ["--beam-overlay" as string]: "rgba(0, 0, 0, 0.05)",
          ["--btn-active-bg" as string]: "transparent",
          ["--btn-active-text" as string]: "var(--header-text)",
          ["--btn-active-border" as string]: "var(--header-secondary-border)",
        } as CSSProperties}
      >
        Book a Call
      </BeamButton>
    </div>
  );
}
