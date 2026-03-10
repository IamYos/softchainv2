"use client";

import { motion, type MotionValue } from "framer-motion";
import { HeaderNavLink } from "@/components/marketing/header/HeaderNavLink";
import {
  HEADER_NAV_ITEMS,
  type HeaderNavItem,
} from "@/components/marketing/header/navigation";

type HeaderDesktopNavProps = {
  textColor: MotionValue<string>;
  onItemClick: (item: HeaderNavItem) => void;
  className?: string;
};

export function HeaderDesktopNav({
  textColor,
  onItemClick,
  className = "",
}: HeaderDesktopNavProps) {
  return (
    <motion.nav
      key="desktop-nav"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`min-w-0 items-center justify-center gap-6 whitespace-nowrap pl-6 text-[16px] ${className}`}
      aria-label="Main navigation"
    >
      {HEADER_NAV_ITEMS.map((item) => (
        <HeaderNavLink
          key={item.label}
          onClick={() => onItemClick(item)}
          textColor={textColor}
        >
          {item.label}
        </HeaderNavLink>
      ))}
    </motion.nav>
  );
}
