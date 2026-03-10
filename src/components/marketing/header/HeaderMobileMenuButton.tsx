"use client";

import { motion, type MotionValue } from "framer-motion";

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
  return (
    <motion.button
      type="button"
      key="mobile-menu-toggle"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      className={`flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer p-2 ${className}`}
      style={{ color: textColor }}
      aria-label="Open menu"
      aria-expanded={isOpen}
      whileHover="hover"
    >
      <motion.span
        className="flex flex-col gap-[5px]"
        variants={{
          hover: {
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="block h-[2px] w-5 rounded-full"
            style={{ backgroundColor: "currentColor" }}
            variants={{
              hover: {
                y: [0, -2, 0],
                transition: {
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              },
            }}
          />
        ))}
      </motion.span>
    </motion.button>
  );
}
