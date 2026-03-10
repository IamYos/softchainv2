"use client";

import { motion, type MotionValue } from "framer-motion";
import { useState } from "react";

type HeaderNavLinkProps = {
  children: React.ReactNode;
  onClick: () => void;
  textColor: MotionValue<string>;
  isActive?: boolean;
};

export function HeaderNavLink({
  children,
  onClick,
  textColor,
  isActive = false,
}: HeaderNavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex cursor-pointer flex-col items-center justify-center transition-opacity duration-300"
      style={{ color: textColor, opacity: isActive || isHovered ? 1 : 0.5 }}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative">
        <span className="relative z-10 font-medium">{children}</span>
        {isHovered && !isActive ? (
          <>
            <motion.span
              className="pointer-events-none absolute inset-0 z-20 select-none bg-clip-text font-medium text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, var(--mf-brand-blue) 45%, var(--mf-brand-red) 55%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
              initial={{ backgroundPosition: "150% 0" }}
              animate={{ backgroundPosition: "-50% 0" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {children}
            </motion.span>
            <motion.div
              className="absolute -bottom-1.5 left-0 right-0 h-px"
              style={{ backgroundColor: "currentColor" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </>
        ) : null}
        {isActive ? (
          <div
            className="absolute -bottom-1.5 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, var(--mf-brand-blue), var(--mf-brand-red))",
            }}
          />
        ) : null}
      </div>
    </motion.button>
  );
}
