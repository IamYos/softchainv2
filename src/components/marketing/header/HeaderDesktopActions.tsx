"use client";

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
        theme="dark"
        style={{
          backgroundColor: "var(--header-secondary-bg)",
          color: "var(--header-text)",
          borderColor: "var(--header-secondary-border)",
          ["--beam-overlay" as string]: "var(--header-secondary-overlay)",
          ["--btn-active-bg" as string]: "var(--header-secondary-active-bg)",
          ["--btn-active-text" as string]: "var(--header-secondary-active-text)",
          ["--btn-active-border" as string]: "var(--header-secondary-active-border)",
        }}
      >
        Contact
      </BeamButton>
      <BeamButton
        onClick={onPrimaryClick}
        theme="light"
        style={{
          backgroundColor: "var(--header-primary-bg)",
          color: "var(--header-primary-text)",
          borderColor: "var(--header-primary-border)",
          ["--beam-overlay" as string]: "var(--header-primary-overlay)",
          ["--btn-active-bg" as string]: "var(--header-primary-active-bg)",
          ["--btn-active-text" as string]: "var(--header-primary-active-text)",
          ["--btn-active-border" as string]: "var(--header-primary-active-border)",
        }}
      >
        Book a Call
      </BeamButton>
    </div>
  );
}
