"use client";

import { HeaderNavLink } from "@/components/marketing/header/HeaderNavLink";
import {
  HEADER_NAV_ITEMS,
  type HeaderNavItem,
} from "@/components/marketing/header/navigation";

type HeaderDesktopNavProps = {
  onItemClick: (item: HeaderNavItem) => void;
  className?: string;
};

export function HeaderDesktopNav({
  onItemClick,
  className = "",
}: HeaderDesktopNavProps) {
  return (
    <nav
      className={`min-w-0 items-center justify-center gap-6 whitespace-nowrap pl-6 text-[12px] ${className}`}
      aria-label="Main navigation"
    >
      {HEADER_NAV_ITEMS.map((item) => (
        <HeaderNavLink key={item.label} onClick={() => onItemClick(item)}>
          {item.label}
        </HeaderNavLink>
      ))}
    </nav>
  );
}
