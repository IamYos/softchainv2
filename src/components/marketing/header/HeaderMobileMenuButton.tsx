"use client";

import { type MotionValue, useMotionValueEvent } from "framer-motion";
import { useRef } from "react";

type HeaderMobileMenuButtonProps = {
  textColor: MotionValue<string>;
  onClick: () => void;
  isOpen: boolean;
  className?: string;
};

export function HeaderMobileMenuButton({
  textColor,
  onClick,
  isOpen,
  className = "",
}: HeaderMobileMenuButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(textColor, "change", (color) => {
    if (btnRef.current) {
      btnRef.current.style.color = color;
    }
  });

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      className={`flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer p-2 ${className}`}
      aria-label="Open menu"
      aria-expanded={isOpen}
    >
      <span className="flex flex-col gap-[5px]">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="block h-[2px] w-5 rounded-full"
            style={{ backgroundColor: "currentColor" }}
          />
        ))}
      </span>
    </button>
  );
}
