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
      <BeamButton onClick={onSecondaryClick} theme="dark">
        Contact
      </BeamButton>
      <BeamButton onClick={onPrimaryClick} theme="light">
        Book a Call
      </BeamButton>
    </div>
  );
}
