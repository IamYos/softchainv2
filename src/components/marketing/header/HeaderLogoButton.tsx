"use client";

import { SoftchainMark } from "@/components/marketing/SoftchainMark";

type HeaderLogoButtonProps = {
  filter?: string;
  onClick: () => void;
  ariaLabel?: string;
};

export function HeaderLogoButton({
  filter,
  onClick,
  ariaLabel = "Scroll to top",
}: HeaderLogoButtonProps) {
  return (
    <button
      type="button"
      className="relative h-[28px] w-[130px] shrink-0 cursor-pointer"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <SoftchainMark filter={filter} />
    </button>
  );
}
