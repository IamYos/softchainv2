"use client";

import { motion, type MotionValue } from "framer-motion";
import { BeamButton } from "@/components/marketing/BeamButton";

type HeaderDesktopActionsProps = {
  textColor: MotionValue<string>;
  primaryBg: MotionValue<string>;
  primaryText: MotionValue<string>;
  secondaryBorder: MotionValue<string>;
  secondaryBg: MotionValue<string>;
  onSecondaryClick: () => void;
  onPrimaryClick: () => void;
  className?: string;
};

export function HeaderDesktopActions({
  textColor,
  primaryBg,
  primaryText,
  secondaryBorder,
  secondaryBg,
  onSecondaryClick,
  onPrimaryClick,
  className = "",
}: HeaderDesktopActionsProps) {
  return (
    <motion.div
      key="desktop-buttons"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`items-center gap-4 ${className}`}
    >
      <BeamButton
        onClick={onSecondaryClick}
        className="rounded px-4 py-2 text-sm font-medium border transition-colors duration-300"
        theme="light"
        style={{
          borderColor: secondaryBorder,
          backgroundColor: secondaryBg,
          color: textColor,
        } as never}
      >
        Contact
      </BeamButton>
      <BeamButton
        onClick={onPrimaryClick}
        className="rounded px-4 py-2 text-sm font-medium border transition-colors duration-300 whitespace-nowrap"
        style={{
          borderColor: secondaryBorder,
          backgroundColor: primaryBg,
          color: primaryText,
        } as never}
      >
        Book a Call
      </BeamButton>
    </motion.div>
  );
}
